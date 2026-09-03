import React, { useState, useEffect, useCallback } from 'react';
import {
  Crosshair,
  Sparkles,
  Shield,
  Star,
  Copy,
  Check,
  Search,
  Code2,
  Terminal,
  Layers,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  Hash,
  Tag,
  MousePointer,
  Info,
  Ruler,
  Filter,
  CheckSquare,
  FileCheck,
  Compass,
} from 'lucide-react';
import {
  DomElementNode,
  PlaywrightLocatorCandidate,
  SupportedLanguage,
  RecordedAction,
} from '../types';
import { generateActionSnippets, generateAssertionSnippets } from '../utils/codeGenerator';

interface ObjectSpyPanelProps {
  selectedElement: DomElementNode | null;
  domTree: DomElementNode[];
  allElements: DomElementNode[];
  onSelectElement: (element: DomElementNode) => void;
  language: SupportedLanguage;
  onAddAction: (action: Omit<RecordedAction, 'id' | 'timestamp'>) => void;
  onHighlightMatches: (ids: string[]) => void;
}

export const ObjectSpyPanel: React.FC<ObjectSpyPanelProps> = ({
  selectedElement,
  domTree,
  allElements,
  onSelectElement,
  language,
  onAddAction,
  onHighlightMatches,
}) => {
  const [activeTab, setActiveTab] = useState<'locators' | 'properties' | 'tree'>('locators');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState('');
  const [queryResult, setQueryResult] = useState<{ matchCount: number; message: string } | null>(null);
  const [treeSearchTerm, setTreeSearchTerm] = useState('');
  const [propSearchTerm, setPropSearchTerm] = useState('');
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());

  // Auto-expand tree nodes initially or when domTree changes
  useEffect(() => {
    if (domTree && domTree.length > 0) {
      const initialIds = new Set<string>();
      const addFirstLevels = (nodes: DomElementNode[], currentDepth: number) => {
        if (currentDepth > 3) return;
        for (const n of nodes) {
          initialIds.add(n.id);
          if (n.children && n.children.length > 0) {
            addFirstLevels(n.children, currentDepth + 1);
          }
        }
      };
      addFirstLevels(domTree, 0);
      setExpandedNodeIds(initialIds);
    }
  }, [domTree]);

  // When selectedElement changes, ensure its ancestor path is expanded
  useEffect(() => {
    if (selectedElement && allElements && allElements.length > 0) {
      const ancestorsToExpand = new Set<string>();
      let currentPath = selectedElement.parentPath;
      while (currentPath) {
        const parentNode = allElements.find((el) => el.path === currentPath);
        if (parentNode) {
          ancestorsToExpand.add(parentNode.id);
          currentPath = parentNode.parentPath;
        } else {
          break;
        }
      }
      if (ancestorsToExpand.size > 0) {
        setExpandedNodeIds((prev) => {
          const next = new Set(prev);
          ancestorsToExpand.forEach((id) => next.add(id));
          return next;
        });
      }
    }
  }, [selectedElement, allElements]);

  const handleExpandAll = () => {
    if (allElements) {
      setExpandedNodeIds(new Set(allElements.map((e) => e.id)));
    }
  };

  const handleCollapseAll = () => {
    setExpandedNodeIds(new Set());
  };

  // Automatically expand matches and their ancestors when searching
  useEffect(() => {
    if (treeSearchTerm.trim() && allElements) {
      const term = treeSearchTerm.toLowerCase();
      const matchingParentIds = new Set<string>();
      for (const el of allElements) {
        const matches =
          el.tagName.toLowerCase().includes(term) ||
          (el.role && el.role.toLowerCase().includes(term)) ||
          (el.testId && el.testId.toLowerCase().includes(term)) ||
          (el.accessibleName && el.accessibleName.toLowerCase().includes(term)) ||
          (el.domId && el.domId.toLowerCase().includes(term)) ||
          (el.innerText && el.innerText.toLowerCase().includes(term));
        if (matches) {
          matchingParentIds.add(el.id);
          let currentPath = el.parentPath;
          while (currentPath) {
            const parentNode = allElements.find((p) => p.path === currentPath);
            if (parentNode) {
              matchingParentIds.add(parentNode.id);
              currentPath = parentNode.parentPath;
            } else {
              break;
            }
          }
        }
      }
      if (matchingParentIds.size > 0) {
        setExpandedNodeIds((prev) => {
          const next = new Set(prev);
          matchingParentIds.forEach((id) => next.add(id));
          return next;
        });
      }
    }
  }, [treeSearchTerm, allElements]);

  const handleCopyText = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Evaluate custom query against all parsed elements
  const runLocatorEvaluation = useCallback(
    (queryStr: string, autoSelectFirstMatch: boolean = false) => {
      if (!queryStr.trim()) {
        setQueryResult(null);
        onHighlightMatches([]);
        return;
      }

      const q = queryStr.trim();
      let matches: DomElementNode[] = [];

      try {
        if (q.startsWith('//') || q.startsWith('xpath=') || q.includes("locator('//") || q.includes('locator("//')) {
          // XPath matching
          const cleanXpath = q.replace(/^page\.locator\(['"]/, '').replace(/['"]\)$/, '').replace(/^xpath=/, '');
          matches = allElements.filter((el) => el.xpath.includes(cleanXpath));
        } else if (q.includes('getByRole')) {
          const roleMatch = q.match(/getByRole\(['"]([^'"]+)['"]/);
          const nameMatch = q.match(/name:\s*['"]([^'"]+)['"]/);
          const targetRole = roleMatch ? roleMatch[1].toLowerCase() : '';
          const targetName = nameMatch ? nameMatch[1].toLowerCase() : '';

          matches = allElements.filter((el) => {
            const roleOk = !targetRole || (el.role && el.role.toLowerCase() === targetRole) || (el.tagName && el.tagName.toLowerCase() === targetRole);
            const nameOk = !targetName || (el.accessibleName && el.accessibleName.toLowerCase().includes(targetName)) || (el.innerText && el.innerText.toLowerCase().includes(targetName));
            return roleOk && nameOk;
          });
        } else if (q.includes('getByTestId')) {
          const idMatch = q.match(/getByTestId\(['"]([^'"]+)['"]/);
          const testId = idMatch ? idMatch[1] : '';
          matches = allElements.filter((el) => el.testId === testId);
        } else if (q.includes('getByLabel')) {
          const labelMatch = q.match(/getByLabel\(['"]([^'"]+)['"]/);
          const label = labelMatch ? labelMatch[1].toLowerCase() : '';
          matches = allElements.filter((el) => {
            const attrLabel = (el.attributes['aria-label'] || '').toLowerCase();
            const ph = (el.attributes['placeholder'] || '').toLowerCase();
            const inner = (el.innerText || '').toLowerCase();
            return attrLabel.includes(label) || ph.includes(label) || inner.includes(label);
          });
        } else if (q.includes('getByPlaceholder')) {
          const phMatch = q.match(/getByPlaceholder\(['"]([^'"]+)['"]/);
          const ph = phMatch ? phMatch[1].toLowerCase() : '';
          matches = allElements.filter((el) => (el.attributes['placeholder'] || '').toLowerCase().includes(ph));
        } else if (q.includes('getByAltText')) {
          const altMatch = q.match(/getByAltText\(['"]([^'"]+)['"]/);
          const alt = altMatch ? altMatch[1].toLowerCase() : '';
          matches = allElements.filter((el) => (el.attributes['alt'] || '').toLowerCase().includes(alt));
        } else if (q.includes('getByTitle')) {
          const titleMatch = q.match(/getByTitle\(['"]([^'"]+)['"]/);
          const title = titleMatch ? titleMatch[1].toLowerCase() : '';
          matches = allElements.filter((el) => (el.attributes['title'] || '').toLowerCase().includes(title));
        } else if (q.includes('getByText')) {
          const textMatch = q.match(/getByText\(['"]([^'"]+)['"]/);
          const text = textMatch ? textMatch[1].toLowerCase() : '';
          matches = allElements.filter((el) => el.innerText && el.innerText.toLowerCase().includes(text));
        } else {
          // CSS selector heuristic
          const cleanCss = q.replace(/^page\.locator\(['"]/, '').replace(/['"]\)$/, '');
          matches = allElements.filter((el) => {
            if (cleanCss.startsWith('#')) return el.domId === cleanCss.slice(1);
            if (cleanCss.startsWith('.')) return el.classes.includes(cleanCss.slice(1));
            if (cleanCss.startsWith('[')) return JSON.stringify(el.attributes).includes(cleanCss.slice(1, -1));
            if (el.tagName.toLowerCase() === cleanCss.toLowerCase()) return true;
            return el.cssSelector.toLowerCase().includes(cleanCss.toLowerCase());
          });
        }
      } catch {
        matches = [];
      }

      // If heuristic missed but string is one of the element's actual locators, fallback match
      if (matches.length === 0 && selectedElement) {
        const isSelectedLoc = selectedElement.locators.some((l) => l.codeTs === q || l.codeJs === q || l.rawSelector === q);
        if (isSelectedLoc) {
          matches = [selectedElement];
        }
      }

      setQueryResult({
        matchCount: matches.length,
        message:
          matches.length === 1
            ? 'Unique element match! (Strict Mode verified)'
            : matches.length > 1
            ? `${matches.length} elements match. May require scoping or chaining`
            : '0 elements matched. Verify selector syntax or element state.',
      });

      onHighlightMatches(matches.map((m) => m.id));
      if (autoSelectFirstMatch && matches.length > 0) {
        onSelectElement(matches[0]);
      }
    },
    [allElements, onHighlightMatches, onSelectElement, selectedElement]
  );

  // Synchronize Custom Evaluator whenever selectedElement changes (on hover or click)
  useEffect(() => {
    if (selectedElement && selectedElement.locators && selectedElement.locators.length > 0) {
      const topLoc = language === 'typescript' ? selectedElement.locators[0].codeTs : selectedElement.locators[0].codeJs;
      setCustomQuery(topLoc);
      runLocatorEvaluation(topLoc, false);
    }
  }, [selectedElement, language, runLocatorEvaluation]);

  const handleEvaluateCustomLocator = (e: React.FormEvent) => {
    e.preventDefault();
    runLocatorEvaluation(customQuery, true);
  };

  // Traversal helpers
  const handleTraverseParent = () => {
    if (!selectedElement || !selectedElement.parentPath) return;
    const parent = allElements.find((el) => el.path === selectedElement.parentPath);
    if (parent) onSelectElement(parent);
  };

  const handleTraverseChild = () => {
    if (!selectedElement || !selectedElement.children || selectedElement.children.length === 0) return;
    onSelectElement(selectedElement.children[0]);
  };

  const toggleNodeExpansion = (id: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Render DOM Tree node recursively
  const renderTreeNode = (node: DomElementNode, depth: number = 0) => {
    const isExpanded = expandedNodeIds.has(node.id);
    const isSelected = selectedElement?.id === node.id;
    const hasChildren = node.children && node.children.length > 0;

    if (treeSearchTerm.trim()) {
      const term = treeSearchTerm.toLowerCase();
      const matchesNode =
        node.tagName.toLowerCase().includes(term) ||
        (node.role && node.role.toLowerCase().includes(term)) ||
        (node.testId && node.testId.toLowerCase().includes(term)) ||
        (node.accessibleName && node.accessibleName.toLowerCase().includes(term)) ||
        (node.domId && node.domId.toLowerCase().includes(term));

      if (!matchesNode && !hasChildren) return null;
    }

    return (
      <div key={node.id} className="flex flex-col">
        <div
          onClick={() => onSelectElement(node)}
          style={{ paddingLeft: `${depth * 14 + 6}px` }}
          className={`flex items-center gap-1.5 py-1 pr-2 rounded text-xs cursor-pointer select-none transition-colors ${
            isSelected
              ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600 font-semibold'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpansion(node.id);
              }}
              className="p-0.5 hover:bg-slate-200 rounded text-slate-500"
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          ) : (
            <span className="w-4" />
          )}

          <span className="font-mono text-indigo-600 font-semibold">&lt;{node.tagName}&gt;</span>

          {node.domId && (
            <span className="font-mono text-amber-600 text-[11px]">#{node.domId}</span>
          )}

          {node.testId && (
            <span className="text-[10px] px-1.5 py-0.2 bg-purple-50 text-purple-700 rounded border border-purple-200 font-mono font-medium">
              data-testid="{node.testId}"
            </span>
          )}

          {node.role && (
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-mono border border-slate-200">
              role={node.role}
            </span>
          )}

          {node.accessibleName && (
            <span className="text-[11px] text-slate-500 truncate max-w-[120px]" title={node.accessibleName}>
              "{node.accessibleName}"
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="flex flex-col">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const bestMatchLocator = selectedElement && selectedElement.locators.length > 0 ? selectedElement.locators[0] : null;
  const bestMatchCode = bestMatchLocator ? (language === 'typescript' ? bestMatchLocator.codeTs : bestMatchLocator.codeJs) : '';

  const assertionSnippets = selectedElement && bestMatchLocator
    ? generateAssertionSnippets(selectedElement, bestMatchLocator, language)
    : [];

  // Helper to compile all DOM and custom attributes of selectedElement as key-value pairs
  const getCompiledAttributes = (el: DomElementNode) => {
    const attrMap: Record<string, string> = { ...el.attributes };
    if (el.domId && !attrMap['id']) attrMap['id'] = el.domId;
    if (el.classes && el.classes.length > 0 && !attrMap['class']) attrMap['class'] = el.classes.join(' ');
    if (el.name && !attrMap['name']) attrMap['name'] = el.name;
    if (el.type && !attrMap['type']) attrMap['type'] = el.type;
    if (el.ariaLabel && !attrMap['aria-label']) attrMap['aria-label'] = el.ariaLabel;
    if (el.placeholder && !attrMap['placeholder']) attrMap['placeholder'] = el.placeholder;
    if (el.testId && !attrMap['data-testid']) attrMap['data-testid'] = el.testId;
    if (el.role && !attrMap['role']) attrMap['role'] = el.role;
    if (el.value !== undefined && el.value !== '' && !attrMap['value']) attrMap['value'] = el.value;
    if (el.href && !attrMap['href']) attrMap['href'] = el.href;
    if (el.src && !attrMap['src']) attrMap['src'] = el.src;
    if (el.alt && !attrMap['alt']) attrMap['alt'] = el.alt;
    if (el.title && !attrMap['title']) attrMap['title'] = el.title;
    if (el.tabIndex !== undefined && !attrMap['tabindex']) attrMap['tabindex'] = String(el.tabIndex);
    if (el.target && !attrMap['target']) attrMap['target'] = el.target;

    const priority = ['id', 'class', 'name', 'type', 'aria-label', 'data-testid', 'placeholder', 'role', 'value', 'href', 'src', 'alt', 'title'];
    return Object.entries(attrMap).sort(([a], [b]) => {
      const idxA = priority.indexOf(a.toLowerCase());
      const idxB = priority.indexOf(b.toLowerCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  };

  const getAttributeBadgeStyle = (key: string) => {
    const k = key.toLowerCase();
    if (k === 'id') return 'bg-amber-100 text-amber-800 border-amber-300';
    if (k === 'class') return 'bg-blue-100 text-blue-800 border-blue-300';
    if (k === 'name') return 'bg-slate-200 text-slate-800 border-slate-300';
    if (k === 'type') return 'bg-violet-100 text-violet-800 border-violet-300';
    if (k.startsWith('aria-')) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (k.startsWith('data-') || k === 'data-testid') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (k === 'placeholder' || k === 'title' || k === 'alt') return 'bg-sky-100 text-sky-800 border-sky-300';
    if (k === 'role') return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Dedicated Element Properties section renderer
  const renderElementPropertiesSection = (el: DomElementNode, filterText: string = '', sectionIdPrefix: string = 'elem_prop') => {
    const allAttrs = getCompiledAttributes(el);
    const filteredAttrs = allAttrs.filter(([k, v]) => {
      if (!filterText.trim()) return true;
      const q = filterText.toLowerCase();
      return k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q);
    });

    return (
      <div id={`${sectionIdPrefix}-element-properties`} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              Element Properties
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 font-mono font-semibold rounded-full border border-indigo-200">
              {allAttrs.length} Attributes
            </span>
          </div>

          <span className="text-[11px] text-slate-500 font-mono font-medium">
            &lt;{el.tagName}&gt;
          </span>
        </div>

        {/* Key-Value Pair Mapping List */}
        {filteredAttrs.length > 0 ? (
          <div className="divide-y divide-slate-100 text-xs font-mono">
            {filteredAttrs.map(([key, val], idx) => {
              const strVal = String(val ?? '');
              const rowKey = `${sectionIdPrefix}_${key}_${idx}`;
              const cssSelector = `[${key}="${strVal.replace(/"/g, '\\"')}"]`;

              return (
                <div
                  key={key}
                  className="py-2 flex items-start justify-between gap-3 hover:bg-slate-50/80 px-1.5 rounded transition-colors group"
                >
                  {/* Key with distinct badge */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getAttributeBadgeStyle(key)}`}>
                      {key}
                    </span>
                  </div>

                  {/* Value display & copy actions */}
                  <div className="flex-1 flex items-center justify-end gap-2 overflow-hidden">
                    <span className="text-slate-800 font-semibold truncate text-right select-all font-mono" title={strVal}>
                      "{strVal}"
                    </span>

                    {/* Quick copy controls */}
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleCopyText(strVal, `${rowKey}_val`)}
                        className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded transition-colors"
                        title="Copy attribute value"
                      >
                        {copiedKey === `${rowKey}_val` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyText(cssSelector, `${rowKey}_sel`)}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-800 text-slate-600 rounded text-[10px] font-mono border border-slate-200 transition-colors"
                        title={`Copy selector: ${cssSelector}`}
                      >
                        {copiedKey === `${rowKey}_sel` ? (
                          <Check className="w-3 h-3 text-emerald-600 inline mr-0.5" />
                        ) : null}
                        <span>[attr]</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 text-center text-slate-400 text-xs">
            {filterText.trim() ? (
              <span>No attributes match query "{filterText}"</span>
            ) : (
              <span>No custom HTML attributes found on &lt;{el.tagName}&gt;</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="object-spy-panel" className="w-full md:w-[480px] lg:w-[540px] bg-slate-50 border-l border-slate-200 flex flex-col h-full text-slate-900 shrink-0 select-text overflow-hidden">
      {/* Panel Tab Navigation */}
      <div className="h-11 bg-white border-b border-slate-200 px-3 flex items-center justify-between text-xs shadow-2xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('locators')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
              activeTab === 'locators'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Target Locators</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
              activeTab === 'properties'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Properties & ARIA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tree')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
              activeTab === 'tree'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>DOM Tree</span>
            {allElements && allElements.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-200/80 text-slate-700 rounded-full font-mono font-medium">
                {allElements.length}
              </span>
            )}
          </button>
        </div>

        {/* Traversal Controls */}
        {selectedElement && (
          <div className="flex items-center gap-0.5 bg-slate-100 border border-slate-200 rounded p-0.5">
            <button
              type="button"
              onClick={handleTraverseParent}
              title="Traverse up to Parent Element"
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleTraverseChild}
              title="Traverse down to First Child"
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
        {/* Selected Element Header & Breadcrumb */}
        {selectedElement ? (
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold font-mono text-indigo-600 bg-indigo-50/60 px-2 py-0.5 rounded border border-indigo-100">
                  &lt;{selectedElement.tagName}&gt;
                </span>
                {selectedElement.domId && (
                  <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                    #{selectedElement.domId}
                  </span>
                )}
                {selectedElement.role && (
                  <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full font-mono font-bold">
                    role: {selectedElement.role}
                  </span>
                )}
                {selectedElement.testId && (
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-mono font-bold">
                    testid: {selectedElement.testId}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedElement.isVisible
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {selectedElement.isVisible ? 'Visible' : 'Hidden'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedElement.isEnabled
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {selectedElement.isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* HIGHLIGHTED BEST MATCH FOR AUTOMATION IN HEADER */}
            {bestMatchLocator && (
              <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-md p-2.5 text-white shadow-xs flex flex-col gap-1.5 border border-indigo-800">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Best Match for Automation</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Strict Mode 1:1 Unique</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 bg-black/40 rounded px-2.5 py-1.5 border border-white/10">
                  <code className="font-mono text-xs text-indigo-200 truncate select-all">
                    {bestMatchCode}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyText(bestMatchCode, 'header_best_loc')}
                    className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white shrink-0 transition-colors"
                    title="Copy Recommended Target Locator"
                  >
                    {copiedKey === 'header_best_loc' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Accessible Name / Text Content */}
            {selectedElement.accessibleName && (
              <div className="text-xs text-slate-700 flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Accessible Name:</span>
                <span className="text-slate-900 font-semibold truncate bg-slate-100 px-1.5 py-0.5 rounded">
                  "{selectedElement.accessibleName}"
                </span>
              </div>
            )}

            {/* Breadcrumb Path */}
            <div className="text-[11px] font-mono text-slate-600 truncate bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              {selectedElement.path}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-500 flex flex-col items-center gap-2.5 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Crosshair className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-800 text-sm">No Element Selected</div>
            <p className="text-xs text-slate-500 max-w-xs">
              Click anywhere on the preview web page or select a node in the DOM Tree to inspect all detailed properties and recommended target locators.
            </p>
          </div>
        )}

        {/* TAB 1: Generated Target Locators Matrix */}
        {activeTab === 'locators' && (
          <div className="flex flex-col gap-3">
            {/* Custom Locator Tester Input */}
            <form onSubmit={handleEvaluateCustomLocator} className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Custom Locator Evaluator</span>
                </label>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomQuery(val);
                    runLocatorEvaluation(val, false);
                  }}
                  placeholder="e.g. getByRole('button', { name: 'Submit' }) or #id or //xpath"
                  className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Test</span>
                </button>
              </div>

              {queryResult && (
                <div
                  className={`text-xs px-2.5 py-1.5 rounded flex items-center gap-2 font-medium ${
                    queryResult.matchCount === 1
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : queryResult.matchCount > 1
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {queryResult.matchCount === 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>{queryResult.message}</span>
                </div>
              )}
            </form>

            {/* Target Locator Recommendations Banner */}
            <div className="bg-white border border-indigo-200 rounded-lg p-3 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Top 2 Best Matches for Automation & UI</span>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold border border-indigo-100">
                  Curated Best Matches
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Filtered strictly to the <strong>2 highest-resilience locators</strong> by analyzing what properties the dev team provided for test automation (<code className="text-indigo-700 bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">data-testid</code>, ID) and what semantic properties are exposed in the user UI (W3C ARIA role, label, placeholder).
              </p>
            </div>

            {/* Generated Top 2 Best Matches List */}
            {selectedElement && selectedElement.locators.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-0.5">
                  <span className="uppercase tracking-wider text-[10px]">The 2 Best Match Locators</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Language: <strong className="text-indigo-600">{language === 'typescript' ? 'TypeScript' : 'JavaScript'}</strong>
                  </span>
                </div>

                {selectedElement.locators.slice(0, 2).map((candidate, idx) => {
                  const codeToCopy = language === 'typescript' ? candidate.codeTs : candidate.codeJs;
                  const isTopRank = idx === 0;
                  const keyId = `loc_${idx}`;
                  const isCopied = copiedKey === keyId;

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-lg border flex flex-col gap-2.5 transition-all ${
                        isTopRank
                          ? 'bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/60 border-2 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                          : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 border-2 border-slate-300 shadow-sm'
                      }`}
                    >
                      {/* Rank & Category Banner */}
                      <div className={`flex items-center justify-between px-2.5 py-1 -mt-1 -mx-1 rounded-md text-[10px] font-bold shadow-2xs ${
                        isTopRank ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-amber-300'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                          <span>{isTopRank ? '★ BEST MATCH #1 (PRIMARY AUTOMATION)' : '★ BEST MATCH #2 (SECONDARY / CONTRACT)'}</span>
                        </div>
                        <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] ${
                          isTopRank ? 'bg-indigo-700 text-white' : 'bg-slate-700 text-amber-200'
                        }`}>
                          {candidate.categoryLabel || (candidate.matchCategory === 'dev_automation' ? 'Dev Contract' : 'User UI')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                              candidate.strategy === 'getByRole'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : candidate.strategy === 'getByLabel' || candidate.strategy === 'getByPlaceholder'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : candidate.strategy === 'getByTestId'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {candidate.strategy}
                          </span>

                          <span className="text-[10px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {candidate.matchCategory === 'dev_automation' ? 'Dev Team Property' : 'Exposed UI Property'}
                          </span>
                        </div>

                        {/* Resilience Rating Stars */}
                        <div className="flex items-center gap-0.5" title={`Resilience score: ${candidate.resilienceRating}/5`}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < candidate.resilienceRating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Code Snippet Box */}
                      <div className={`p-2.5 rounded-md border font-mono text-xs overflow-x-auto select-all shadow-xs ${
                        isTopRank ? 'bg-slate-950 text-indigo-300 border-slate-800' : 'bg-slate-900 text-indigo-300 border-slate-800'
                      }`}>
                        {codeToCopy}
                      </div>

                      {/* Description & Best Match Justification */}
                      {candidate.bestMatchReason && (
                        <div className={`border rounded p-2 text-[11px] flex items-start gap-1.5 ${
                          isTopRank ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}>
                          <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span><strong>Why this match is selected:</strong> {candidate.bestMatchReason}</span>
                        </div>
                      )}

                      {/* Quick Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setCustomQuery(codeToCopy);
                            runLocatorEvaluation(codeToCopy, false);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-xs font-semibold border border-indigo-200 transition-colors"
                          title="Load this locator into Custom Evaluator"
                        >
                          <Terminal className="w-3 h-3 text-indigo-600" />
                          <span>Test in Evaluator</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onAddAction({
                              actionType: selectedElement.tagName === 'input' ? 'fill' : 'click',
                              selectedLocator: codeToCopy,
                              locatorStrategy: candidate.strategy,
                              value: selectedElement.value || 'Test QA input',
                              comment: `Interact with ${selectedElement.tagName}`,
                            });
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
                        >
                          <Plus className="w-3 h-3 text-indigo-600" />
                          <span>Add to Journey</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyText(codeToCopy, keyId)}
                          className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold transition-colors shadow-2xs ${
                            isTopRank ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Locator</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Action & Assertion Generator for Current Element */}
            {selectedElement && (
              <div className="flex flex-col gap-2 mt-1 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Quick Test Assertions for Best Match
                </span>
                <div className="flex flex-col gap-1.5">
                  {assertionSnippets.slice(0, 4).map((snippet, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded text-xs font-mono text-slate-800 border border-slate-200"
                    >
                      <span className="truncate text-indigo-700 font-semibold">{snippet.code}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(snippet.code, `assert_${idx}`)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 transition-colors"
                        title="Copy assertion"
                      >
                        {copiedKey === `assert_${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnostic Element Properties Section for Selected Locator */}
            {selectedElement && renderElementPropertiesSection(selectedElement, '', 'loc_tab')}
          </div>
        )}

        {/* TAB 2: Properties & Computed ARIA (Detailed Element Properties) */}
        {activeTab === 'properties' && selectedElement && (
          <div className="flex flex-col gap-3">
            {/* Search Filter for Properties */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="search"
                value={propSearchTerm}
                onChange={(e) => setPropSearchTerm(e.target.value)}
                placeholder="Search element properties & attributes (e.g. id, class, name, type, aria-label)..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium shadow-2xs"
              />
            </div>

            {/* Element Properties Section - Full Key-Value Pairs */}
            {renderElementPropertiesSection(selectedElement, propSearchTerm, 'prop_tab')}

            {/* AUTOMATION 2 BEST MATCHES CARD ON PROPERTIES SCREEN */}
            {selectedElement.locators.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-2 border-indigo-500 rounded-lg p-3.5 shadow-sm flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>The 2 Best Matches for Automation</span>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                    Strict Mode Compatible
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {selectedElement.locators.slice(0, 2).map((loc, i) => {
                    const code = language === 'typescript' ? loc.codeTs : loc.codeJs;
                    const isRank1 = i === 0;
                    return (
                      <div key={i} className="bg-slate-900 text-indigo-200 p-2.5 rounded font-mono text-xs border border-slate-800 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              isRank1 ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-amber-300'
                            }`}>
                              Rank #{i + 1}
                            </span>
                            <span className="text-[10px] text-slate-300 font-sans font-medium">
                              {loc.categoryLabel || loc.strategy}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyText(code, `prop_match_${i}`)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors shrink-0"
                            title="Copy locator"
                          >
                            {copiedKey === `prop_match_${i}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="truncate select-all text-indigo-300">{code}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 1: Core Tag & DOM Identification */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>DOM & Tag Identification</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Depth: {selectedElement.depth}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-50 rounded border border-slate-200 flex flex-col">
                  <span className="text-slate-500 text-[10px] font-semibold uppercase">HTML Tag</span>
                  <span className="font-mono font-bold text-indigo-700">&lt;{selectedElement.tagName}&gt;</span>
                </div>

                <div className="p-2 bg-slate-50 rounded border border-slate-200 flex flex-col">
                  <span className="text-slate-500 text-[10px] font-semibold uppercase">DOM ID</span>
                  <span className="font-mono font-bold text-amber-700">{selectedElement.domId ? `#${selectedElement.domId}` : 'none'}</span>
                </div>

                <div className="p-2 bg-slate-50 rounded border border-slate-200 flex flex-col">
                  <span className="text-slate-500 text-[10px] font-semibold uppercase">Name Attribute</span>
                  <span className="font-mono font-bold text-slate-800">{selectedElement.name || 'none'}</span>
                </div>

                <div className="p-2 bg-slate-50 rounded border border-slate-200 flex flex-col">
                  <span className="text-slate-500 text-[10px] font-semibold uppercase">Child Elements</span>
                  <span className="font-bold text-slate-800">{selectedElement.childrenCount} child nodes</span>
                </div>
              </div>

              {/* Class List Badges */}
              {selectedElement.classes.length > 0 && (
                <div className="flex flex-col gap-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                    <span>CSS Class Names ({selectedElement.classes.length}):</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(selectedElement.classes.join(' '), 'prop_classes')}
                      className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5"
                    >
                      {copiedKey === 'prop_classes' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copy All</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedElement.classes.map((cls, i) => (
                      <span
                        key={i}
                        onClick={() => handleCopyText(cls, `cls_${i}`)}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded text-[10px] font-mono border border-slate-200 cursor-pointer transition-colors"
                        title="Click to copy class name"
                      >
                        .{cls}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: ARIA & Accessibility (W3C AccName Specification) */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-purple-600" />
                  <span>W3C ARIA & Accessibility Specifications</span>
                </span>
                <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                  AccName Tree
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-50 rounded border border-slate-200 flex flex-col">
                  <span className="text-slate-500 text-[10px] font-semibold uppercase">Computed ARIA Role</span>
                  <span className="font-mono font-bold text-purple-700">{selectedElement.role || 'generic'}</span>
                </div>

                <div className="p-2 bg-slate-50 rounded border border-slate-200 flex flex-col">
                  <span className="text-slate-500 text-[10px] font-semibold uppercase">Heading Level</span>
                  <span className="font-bold text-slate-800">
                    {selectedElement.headingLevel ? `Level ${selectedElement.headingLevel} (<h${selectedElement.headingLevel}>)` : 'N/A'}
                  </span>
                </div>

                <div className="col-span-2 p-2 bg-slate-50 rounded border border-slate-200 flex flex-col">
                  <span className="text-slate-500 text-[10px] font-semibold uppercase">Accessible Name</span>
                  <span className="font-semibold text-slate-900 break-words">
                    {selectedElement.accessibleName ? `"${selectedElement.accessibleName}"` : 'None / Empty'}
                  </span>
                </div>

                {selectedElement.ariaLabel && (
                  <div className="col-span-2 p-2 bg-slate-50 rounded border border-slate-200 flex flex-col">
                    <span className="text-slate-500 text-[10px] font-semibold uppercase">aria-label</span>
                    <span className="font-mono font-semibold text-indigo-700">"{selectedElement.ariaLabel}"</span>
                  </div>
                )}

                {selectedElement.ariaLabelledby && (
                  <div className="p-2 bg-slate-50 rounded border border-slate-200 flex flex-col">
                    <span className="text-slate-500 text-[10px] font-semibold uppercase">aria-labelledby</span>
                    <span className="font-mono text-slate-800">#{selectedElement.ariaLabelledby}</span>
                  </div>
                )}

                {selectedElement.ariaDescribedby && (
                  <div className="p-2 bg-slate-50 rounded border border-slate-200 flex flex-col">
                    <span className="text-slate-500 text-[10px] font-semibold uppercase">aria-describedby</span>
                    <span className="font-mono text-slate-800">#{selectedElement.ariaDescribedby}</span>
                  </div>
                )}
              </div>

              {/* ARIA States Matrix */}
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-[10px] font-semibold text-slate-500">ARIA State Flags:</span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600">expanded:</span>
                    <span className={`font-bold ${selectedElement.ariaExpanded ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {String(selectedElement.ariaExpanded ?? 'false')}
                    </span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600">pressed:</span>
                    <span className={`font-bold ${selectedElement.ariaPressed ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {String(selectedElement.ariaPressed ?? 'false')}
                    </span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600">checked:</span>
                    <span className={`font-bold ${selectedElement.ariaChecked || selectedElement.checked ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {String(selectedElement.ariaChecked ?? selectedElement.checked ?? 'false')}
                    </span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600">selected:</span>
                    <span className={`font-bold ${selectedElement.ariaSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {String(selectedElement.ariaSelected ?? 'false')}
                    </span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600">disabled:</span>
                    <span className={`font-bold ${selectedElement.ariaDisabled || !selectedElement.isEnabled ? 'text-rose-600' : 'text-slate-400'}`}>
                      {String(selectedElement.ariaDisabled ?? !selectedElement.isEnabled)}
                    </span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600">hidden:</span>
                    <span className={`font-bold ${selectedElement.ariaHidden || !selectedElement.isVisible ? 'text-rose-600' : 'text-slate-400'}`}>
                      {String(selectedElement.ariaHidden ?? !selectedElement.isVisible)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Interactive & Form Controls State */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <MousePointer className="w-3.5 h-3.5 text-blue-600" />
                  <span>Interactive & Form State</span>
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  selectedElement.isInteractive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  {selectedElement.isInteractive ? 'Interactive Control' : 'Static Element'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedElement.type && (
                  <div className="p-2 bg-slate-50 rounded border border-slate-200 flex flex-col">
                    <span className="text-slate-500 text-[10px] font-semibold uppercase">Input Type</span>
                    <span className="font-mono font-bold text-slate-800">type="{selectedElement.type}"</span>
                  </div>
                )}

                {selectedElement.value !== undefined && selectedElement.value !== '' && (
                  <div className="p-2 bg-slate-50 rounded border border-slate-200 flex flex-col">
                    <span className="text-slate-500 text-[10px] font-semibold uppercase">Current Value</span>
                    <span className="font-mono font-bold text-indigo-700 truncate">"{selectedElement.value}"</span>
                  </div>
                )}

                {selectedElement.placeholder && (
                  <div className="col-span-2 p-2 bg-slate-50 rounded border border-slate-200 flex flex-col">
                    <span className="text-slate-500 text-[10px] font-semibold uppercase">Placeholder</span>
                    <span className="font-mono text-slate-700">"{selectedElement.placeholder}"</span>
                  </div>
                )}

                {selectedElement.href && (
                  <div className="col-span-2 p-2 bg-slate-50 rounded border border-slate-200 flex flex-col">
                    <span className="text-slate-500 text-[10px] font-semibold uppercase">Link Href & Target</span>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-indigo-700 truncate">{selectedElement.href}</span>
                      {selectedElement.target && (
                        <span className="text-[10px] px-1 bg-slate-200 rounded font-mono shrink-0">
                          target={selectedElement.target}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {selectedElement.tabIndex !== undefined && (
                  <div className="p-2 bg-slate-50 rounded border border-slate-200 flex flex-col">
                    <span className="text-slate-500 text-[10px] font-semibold uppercase">Tab Index</span>
                    <span className="font-mono font-bold text-slate-800">tabindex="{selectedElement.tabIndex}"</span>
                  </div>
                )}

                {selectedElement.required && (
                  <div className="p-2 bg-rose-50 rounded border border-rose-200 flex items-center gap-1.5 text-rose-800 font-semibold">
                    <CheckSquare className="w-3.5 h-3.5 text-rose-600" />
                    <span>Required Field</span>
                  </div>
                )}

                {selectedElement.readOnly && (
                  <div className="p-2 bg-slate-100 rounded border border-slate-200 flex items-center gap-1.5 text-slate-700 font-semibold">
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    <span>Read Only</span>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: Geometry & Viewport Coordinates */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Geometry & Bounding Box</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Viewport Metrics</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono">
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">X</span>
                  <span className="font-bold text-slate-800">{selectedElement.rect.x} px</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Y</span>
                  <span className="font-bold text-slate-800">{selectedElement.rect.y} px</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Width</span>
                  <span className="font-bold text-indigo-700">{selectedElement.rect.width} px</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Height</span>
                  <span className="font-bold text-indigo-700">{selectedElement.rect.height} px</span>
                </div>
              </div>

              {/* Center Coordinate for Mouse Actions */}
              <div className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 text-[11px]">
                  Center Point (for <code className="font-mono text-indigo-600">page.mouse.click</code>):
                </span>
                <span className="font-mono font-bold text-slate-800">
                  ({Math.round(selectedElement.rect.x + selectedElement.rect.width / 2)},{' '}
                  {Math.round(selectedElement.rect.y + selectedElement.rect.height / 2)})
                </span>
              </div>
            </div>

            {/* SECTION 5: XPath & CSS Full Hierarchy */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Full XPath & Hierarchy Path
              </span>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">XPath:</span>
                  <code className="font-mono text-xs text-slate-800 break-all select-all flex-1 text-right">
                    {selectedElement.xpath}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyText(selectedElement.xpath, 'xpath_copy')}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 shrink-0"
                    title="Copy XPath"
                  >
                    {copiedKey === 'xpath_copy' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">CSS Path:</span>
                  <code className="font-mono text-xs text-indigo-700 break-all select-all flex-1 text-right">
                    {selectedElement.path}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyText(selectedElement.path, 'csspath_copy')}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 shrink-0"
                    title="Copy CSS Path"
                  >
                    {copiedKey === 'csspath_copy' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Full DOM Tree Explorer */}
        {activeTab === 'tree' && (
          <div className="flex flex-col gap-2.5">
            {/* Search Filter & Tree Toolbar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="search"
                  value={treeSearchTerm}
                  onChange={(e) => setTreeSearchTerm(e.target.value)}
                  placeholder="Filter DOM tree by tag, testid, text, role..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors shadow-2xs"
                  title="Expand All Nodes"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors shadow-2xs"
                  title="Collapse All Nodes"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Tree Container */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs max-h-[640px] overflow-y-auto font-sans">
              {domTree && domTree.length > 0 ? (
                domTree.map((node) => renderTreeNode(node, 0))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-1.5">
                  <Layers className="w-6 h-6 text-slate-300" />
                  <span>No DOM nodes found for this page preview.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
