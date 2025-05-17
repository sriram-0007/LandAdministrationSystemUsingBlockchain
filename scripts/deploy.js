const hre = require("hardhat");

async function main() {
  const LandAdministration = await hre.ethers.getContractFactory("LandAdministration");
  const landAdministration = await LandAdministration.deploy(); // Deploy contract

  await landAdministration.waitForDeployment(); // Wait for deployment

  console.log("Contract deployed to:", await landAdministration.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
//0x5d573a57a994867648e20CD5c0ca68f32C31ae75 deployed address