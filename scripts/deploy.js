const { ethers } = require("hardhat");

async function main() {
  console.log("Starting WKAIA deployment...");

  // Get the contract factory
  const WKAIA = await ethers.getContractFactory("WKAIA");
  console.log("WKAIA contract factory loaded");

  // Deploy the contract
  console.log("Deploying WKAIA contract...");
  const wkaia = await WKAIA.deploy();
  
  // Wait for deployment to complete
  await wkaia.waitForDeployment();
  
  const contractAddress = await wkaia.getAddress();
  console.log("WKAIA deployed to:", contractAddress);

  // Verify deployment by checking contract state
  console.log("Verifying deployment...");
  
  const name = await wkaia.name();
  const symbol = await wkaia.symbol();
  const decimals = await wkaia.decimals();
  const totalSupply = await wkaia.totalSupply();
  
  console.log("Contract verification successful:");
  console.log("  Name:", name);
  console.log("  Symbol:", symbol);
  console.log("  Decimals:", decimals.toString());
  console.log("  Total Supply:", ethers.formatEther(totalSupply), "WKAIA");
  
  console.log("\nDeployment completed successfully!");
  console.log("Contract address:", contractAddress);
  
  // Save deployment info to a file for reference
  const fs = require("fs");
  const deploymentInfo = {
    contractName: "WKAIA",
    address: contractAddress,
    network: hre.network.name,
    deployer: (await ethers.getSigners())[0].address,
    deploymentTime: new Date().toISOString(),
    constructorArgs: []
  };
  
  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const deploymentFile = `${deploymentsDir}/wkaia-${hre.network.name}.json`;
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to:", deploymentFile);
  
  return contractAddress;
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
