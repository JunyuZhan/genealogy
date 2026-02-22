import * as d3 from 'd3';
import { type Member, type FamilyLink, RelationshipType } from '../types';

export interface TreeNode extends d3.HierarchyNode<Member> {
  x0?: number;
  y0?: number;
  _children?: TreeNode[]; // For collapsed state
}

/**
 * Builds a hierarchical structure from a flat list of members.
 * Currently supports a single root (ancestor) view.
 * 
 * @param members Flat list of all members
 * @param rootId ID of the root member to start the tree from
 */
export function buildTreeData(members: Member[], rootId: string): Member | null {
  const memberMap = new Map<string, Member>();
  members.forEach(m => memberMap.set(m.id, { ...m, children: [] })); // Clone to avoid mutating original

  const root = memberMap.get(rootId);
  if (!root) return null;

  return null; 
}

export interface D3MemberNode extends Omit<Member, 'children' | 'parents'> {
  children?: D3MemberNode[];
  _children?: D3MemberNode[]; // For collapsed state
  originalChildrenLinks: FamilyLink[]; // Keep original links
  originalParentLinks: FamilyLink[];
}

export function transformToD3Tree(members: Member[], rootId: string): D3MemberNode | null {
  const memberMap = new Map<string, Member>();
  members.forEach(m => memberMap.set(m.id, m));

  const rootMember = memberMap.get(rootId);
  if (!rootMember) return null;

  function buildNode(member: Member): D3MemberNode {
    const d3Node: D3MemberNode = {
      ...member,
      children: undefined, // Default to undefined for leaf nodes
      originalChildrenLinks: member.children,
      originalParentLinks: member.parents
    };

    const childLinks = member.children.filter(link => 
      link.relationship === RelationshipType.BIOLOGICAL || 
      link.relationship === RelationshipType.ADOPTED
    );

    if (childLinks.length > 0) {
      const children = childLinks
        .map(link => {
          const childMember = memberMap.get(link.targetId);
          if (childMember) {
            return buildNode(childMember);
          }
          return null;
        })
        .filter((n): n is D3MemberNode => n !== null);
      
      if (children.length > 0) {
        d3Node.children = children;
      }
    }

    return d3Node;
  }

  return buildNode(rootMember);
}
