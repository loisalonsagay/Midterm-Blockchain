// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TipPost {
    struct Post {
        uint256 id;
        address creator;
        string imageUrl;
        string caption;
        uint256 likes;
        uint256 totalEarned;
        uint256 timestamp;
    }

    uint256 public postCount = 0;
    uint256 public likeCost = 0.0001 ether;

    mapping(uint256 => Post) public posts;
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    mapping(address => uint256) public totalEarnedByUser;

   event PostCreated(
    uint256 indexed id,
    address indexed creator,
    string imageUrl,
    string caption,
    uint256 timestamp
);

    event PostLiked(
    uint256 indexed postId,
    address indexed liker,
    uint256 newLikeCount,
    uint256 timestamp
);

    function createPost(string calldata _imageUrl, string calldata _caption) external {
        require(bytes(_imageUrl).length > 0, "Image URL cannot be empty");
        require(bytes(_caption).length > 0, "Caption cannot be empty");

        posts[postCount] = Post(
            postCount,
            msg.sender,
            _imageUrl,
            _caption,
            0,
            0,
            block.timestamp
        );

        emit PostCreated(postCount, msg.sender, _imageUrl, _caption, block.timestamp);
        postCount++;
    }

    function likePost(uint256 _postId) external payable {
        require(_postId < postCount, "Post does not exist");
        require(msg.value == likeCost, "Incorrect ETH amount sent");
        require(!hasLiked[_postId][msg.sender], "You have already liked this post");
        require(msg.sender != posts[_postId].creator, "You cannot like your own post");

        hasLiked[_postId][msg.sender] = true;
        posts[_postId].likes++;
        posts[_postId].totalEarned += msg.value;
        totalEarnedByUser[posts[_postId].creator] += msg.value;

        // Transfer ETH to post creator
        (bool success, ) = posts[_postId].creator.call{value: msg.value}("");
        require(success, "ETH transfer failed");

        emit PostLiked(_postId, msg.sender, posts[_postId].likes, block.timestamp);
    }

    function getAllPosts() external view returns (Post[] memory) {
        Post[] memory allPosts = new Post[](postCount);
        for (uint256 i = 0; i < postCount; i++) {
            allPosts[i] = posts[i];
        }
        return allPosts;
    }

    function checkLiked(uint256 _postId, address _user) external view returns (bool) {
        return hasLiked[_postId][_user];
    }

    function getPost(uint256 _postId) external view returns (Post memory) {
        require(_postId < postCount, "Post does not exist");
        return posts[_postId];
    }
}