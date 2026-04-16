const hre = require("hardhat");

async function main() {
  console.log("Deploying TipPost contract...");

  const TipPost = await hre.ethers.getContractFactory("TipPost");
  const tipPost = await TipPost.deploy();

  await tipPost.waitForDeployment();

  const address = await tipPost.getAddress();
  console.log("TipPost deployed to:", address);
  
  // Wait for block confirmations
  await tipPost.deploymentTransaction().wait(5);
  
  // Verify on Etherscan
  try {
    console.log("Verifying on Etherscan...");
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
  } catch (error) {
    console.log("Verification failed:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});