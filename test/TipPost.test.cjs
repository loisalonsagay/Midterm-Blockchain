const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TipPost", function () {
  let tipPost;
  let owner;
  let addr1;
  let addr2;
  const LIKE_COST = ethers.parseEther("0.0001");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const TipPost = await ethers.getContractFactory("TipPost");
    tipPost = await TipPost.deploy();
  });

  describe("createPost", function () {
    it("Should create a new post with image and caption", async function () {
      const imageUrl = "https://example.com/image.jpg";
      const caption = "This is my first post!";

      await expect(tipPost.createPost(imageUrl, caption))
        .to.emit(tipPost, "PostCreated");

      const post = await tipPost.getPost(0);
      expect(post.creator).to.equal(owner.address);
      expect(post.imageUrl).to.equal(imageUrl);
      expect(post.caption).to.equal(caption);
      expect(post.likes).to.equal(0);
      expect(post.timestamp).to.be.gt(0);
    });

    it("Should revert if image URL is empty", async function () {
      await expect(tipPost.createPost("", "Caption"))
        .to.be.revertedWith("Image URL cannot be empty");
    });

    it("Should revert if caption is empty", async function () {
      await expect(tipPost.createPost("https://example.com/image.jpg", ""))
        .to.be.revertedWith("Caption cannot be empty");
    });
  });

  describe("likePost", function () {
    beforeEach(async function () {
      await tipPost.createPost("https://example.com/image.jpg", "Test post");
    });

    it("Should successfully like a post and transfer ETH to creator", async function () {
      await expect(tipPost.connect(addr1).likePost(0, { value: LIKE_COST }))
        .to.emit(tipPost, "PostLiked");

      const post = await tipPost.getPost(0);
      expect(post.likes).to.equal(1);
      expect(post.totalEarned).to.equal(LIKE_COST);

      const hasLiked = await tipPost.checkLiked(0, addr1.address);
      expect(hasLiked).to.be.true;

      const totalEarned = await tipPost.totalEarnedByUser(owner.address);
      expect(totalEarned).to.equal(LIKE_COST);
    });

    it("Should reject double like from same user", async function () {
      await tipPost.connect(addr1).likePost(0, { value: LIKE_COST });

      await expect(tipPost.connect(addr1).likePost(0, { value: LIKE_COST }))
        .to.be.revertedWith("You have already liked this post");
    });

    it("Should reject self-like", async function () {
      await expect(tipPost.likePost(0, { value: LIKE_COST }))
        .to.be.revertedWith("You cannot like your own post");
    });

    it("Should reject incorrect ETH amount", async function () {
      await expect(
        tipPost.connect(addr1).likePost(0, { value: ethers.parseEther("0.001") })
      ).to.be.revertedWith("Incorrect ETH amount sent");
    });
  });

  describe("getAllPosts", function () {
    it("Should return all posts", async function () {
      await tipPost.createPost("https://example.com/image1.jpg", "Post 1");
      await tipPost.createPost("https://example.com/image2.jpg", "Post 2");

      const allPosts = await tipPost.getAllPosts();
      expect(allPosts.length).to.equal(2);
      expect(allPosts[0].caption).to.equal("Post 1");
      expect(allPosts[1].caption).to.equal("Post 2");
    });
  });
});