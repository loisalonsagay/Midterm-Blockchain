// export interface Post {
//   author: string;
//   content: string;
//   timestamp: bigint;
//   totalTips: bigint;
//   exists: boolean;
// }

// export interface Tip {
//   tipper: string;
//   amount: bigint;
//   message: string;
//   timestamp: bigint;
// }

// export interface ContractData {
//   posts: Post[];
//   tips: Tip[];
//   totalPosts: number;
// }

export interface Post {
  id: bigint;
  creator: string;
  imageUrl: string;
  caption: string;
  likes: bigint;
  totalEarned: bigint;
  timestamp: bigint;
}

export interface ContractData {
  posts: Post[];
  totalPosts: number;
}