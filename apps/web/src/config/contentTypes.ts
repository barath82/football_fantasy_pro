import type { ContentType, SourceType } from '../data/contentLinks';

export type { ContentType, SourceType };

export interface ContentTypeConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
  sectionIcon: string;
}

export const CONTENT_TYPE_CONFIG: Record<ContentType, ContentTypeConfig> = {
  Captaincy: {
    label: 'Captaincy',
    color: '#a78bfa',
    bg: 'rgba(124, 58, 237, 0.15)',
    border: 'rgba(124, 58, 237, 0.3)',
    icon: '⚔️',
    sectionIcon: '⚔️',
  },
  Differentials: {
    label: 'Differentials',
    color: '#34d399',
    bg: 'rgba(5, 150, 105, 0.15)',
    border: 'rgba(5, 150, 105, 0.3)',
    icon: '🎯',
    sectionIcon: '🎯',
  },
  'Transfer Tips': {
    label: 'Transfer Tips',
    color: '#60a5fa',
    bg: 'rgba(37, 99, 235, 0.15)',
    border: 'rgba(37, 99, 235, 0.3)',
    icon: '🔄',
    sectionIcon: '🔄',
  },
  'Team Reveal': {
    label: 'Team Reveal',
    color: '#fbbf24',
    bg: 'rgba(217, 119, 6, 0.15)',
    border: 'rgba(217, 119, 6, 0.3)',
    icon: '👁️',
    sectionIcon: '👁️',
  },
  'Injury News': {
    label: 'Injury News',
    color: '#f87171',
    bg: 'rgba(220, 38, 38, 0.15)',
    border: 'rgba(220, 38, 38, 0.3)',
    icon: '🏥',
    sectionIcon: '🏥',
  },
  'Fixture Analysis': {
    label: 'Fixture Analysis',
    color: '#22d3ee',
    bg: 'rgba(8, 145, 178, 0.15)',
    border: 'rgba(8, 145, 178, 0.3)',
    icon: '📅',
    sectionIcon: '📅',
  },
  Watchlist: {
    label: 'Watchlist',
    color: '#f59e0b',
    bg: 'rgba(180, 83, 9, 0.15)',
    border: 'rgba(180, 83, 9, 0.3)',
    icon: '👀',
    sectionIcon: '👀',
  },
  'Price Changes': {
    label: 'Price Changes',
    color: '#f472b6',
    bg: 'rgba(219, 39, 119, 0.15)',
    border: 'rgba(219, 39, 119, 0.3)',
    icon: '💰',
    sectionIcon: '💰',
  },
  'Predicted Lineups': {
    label: 'Predicted Lineups',
    color: '#818cf8',
    bg: 'rgba(79, 70, 229, 0.15)',
    border: 'rgba(79, 70, 229, 0.3)',
    icon: '📋',
    sectionIcon: '📋',
  },
  'General Preview': {
    label: 'General Preview',
    color: '#94a3b8',
    bg: 'rgba(71, 85, 105, 0.15)',
    border: 'rgba(71, 85, 105, 0.3)',
    icon: '📰',
    sectionIcon: '📰',
  },
  Tools: {
    label: 'Tools',
    color: '#2dd4bf',
    bg: 'rgba(13, 148, 136, 0.15)',
    border: 'rgba(13, 148, 136, 0.3)',
    icon: '🔧',
    sectionIcon: '🔧',
  },
  Community: {
    label: 'Community',
    color: '#fb7185',
    bg: 'rgba(225, 29, 72, 0.15)',
    border: 'rgba(225, 29, 72, 0.3)',
    icon: '👥',
    sectionIcon: '👥',
  },
};

export const SOURCE_TYPE_CONFIG: Record<SourceType, { label: string; color: string; bg: string }> = {
  website: { label: 'Website', color: '#60a5fa', bg: 'rgba(37, 99, 235, 0.12)' },
  youtube: { label: 'YouTube', color: '#f87171', bg: 'rgba(220, 38, 38, 0.12)' },
  x: { label: 'X / Twitter', color: '#e2e8f0', bg: 'rgba(255, 255, 255, 0.06)' },
  podcast: { label: 'Podcast', color: '#a78bfa', bg: 'rgba(124, 58, 237, 0.12)' },
  community: { label: 'Community', color: '#34d399', bg: 'rgba(5, 150, 105, 0.12)' },
  tool: { label: 'Tool', color: '#2dd4bf', bg: 'rgba(13, 148, 136, 0.12)' },
};

export const ALL_CONTENT_TYPES: ContentType[] = [
  'Captaincy',
  'Differentials',
  'Transfer Tips',
  'Team Reveal',
  'Injury News',
  'Fixture Analysis',
  'Watchlist',
  'Price Changes',
  'Predicted Lineups',
  'General Preview',
  'Tools',
  'Community',
];

export const ALL_SOURCE_TYPES: SourceType[] = [
  'website', 'youtube', 'x', 'podcast', 'community', 'tool',
];

export const MOCK_GWS = [1, 2, 3, 4, 5];
