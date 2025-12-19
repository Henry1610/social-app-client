import LikeIcon, { LoveIcon, HahaIcon, WowIcon, SadIcon, AngryIcon } from "../components/ReactionIcons";

// Reaction types với icon components và metadata
export const reactionTypes = [
  { type: 'LIKE', icon: LikeIcon, label: 'Thích', color: 'text-blue-600' },
  { type: 'LOVE', icon: LoveIcon, label: 'Yêu thích', color: 'text-red-500' },
  { type: 'HAHA', icon: HahaIcon, label: 'Haha', color: 'text-yellow-500' },
  { type: 'WOW', icon: WowIcon, label: 'Wow', color: 'text-yellow-400' },
  { type: 'SAD', icon: SadIcon, label: 'Buồn', color: 'text-gray-500' },
  { type: 'ANGRY', icon: AngryIcon, label: 'Giận', color: 'text-red-600' },
];

// Helper để get reaction type config
export const getReactionType = (type) => {
  return reactionTypes.find(r => r.type === type);
};

// Reaction types cho modal (bao gồm ALL)
export const reactionTypesWithAll = [
  { type: 'ALL', label: 'Tất cả', icon: null },
  ...reactionTypes,
];

