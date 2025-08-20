const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WKAIA", function () {
  let wkaia;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    
    const WKAIA = await ethers.getContractFactory("WKAIA");
    wkaia = await WKAIA.deploy();
    await wkaia.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name, symbol, and decimals", async function () {
      expect(await wkaia.name()).to.equal("Wrapped Kaia");
      expect(await wkaia.symbol()).to.equal("WKAIA");
      expect(await wkaia.decimals()).to.equal(18);
    });

    it("Should start with zero total supply", async function () {
      expect(await wkaia.totalSupply()).to.equal(0);
    });
  });

  describe("Deposit", function () {
    it("Should accept KAIA deposits", async function () {
      const depositAmount = ethers.parseEther("1.0");
      
      await expect(wkaia.connect(user1).deposit({ value: depositAmount }))
        .to.emit(wkaia, "Deposit")
        .withArgs(user1.address, depositAmount);
      
      expect(await wkaia.balanceOf(user1.address)).to.equal(depositAmount);
      expect(await wkaia.totalSupply()).to.equal(depositAmount);
    });

    it("Should accept KAIA via fallback function", async function () {
      const depositAmount = ethers.parseEther("0.5");
      
      await expect(user1.sendTransaction({
        to: await wkaia.getAddress(),
        value: depositAmount
      }))
        .to.emit(wkaia, "Deposit")
        .withArgs(user1.address, depositAmount);
      
      expect(await wkaia.balanceOf(user1.address)).to.equal(depositAmount);
    });

    it("Should handle multiple deposits from same user", async function () {
      const deposit1 = ethers.parseEther("1.0");
      const deposit2 = ethers.parseEther("2.0");
      
      await wkaia.connect(user1).deposit({ value: deposit1 });
      await wkaia.connect(user1).deposit({ value: deposit2 });
      
      expect(await wkaia.balanceOf(user1.address)).to.equal(ethers.parseEther("3.0"));
      expect(await wkaia.totalSupply()).to.equal(ethers.parseEther("3.0"));
    });
  });

  describe("Withdraw", function () {
    beforeEach(async function () {
      await wkaia.connect(user1).deposit({ value: ethers.parseEther("2.0") });
    });

    it("Should allow users to withdraw their balance", async function () {
      const withdrawAmount = ethers.parseEther("1.0");
      
      await expect(wkaia.connect(user1).withdraw(withdrawAmount))
        .to.emit(wkaia, "Withdrawal")
        .withArgs(user1.address, withdrawAmount);
      
      expect(await wkaia.balanceOf(user1.address)).to.equal(ethers.parseEther("1.0"));
      expect(await wkaia.totalSupply()).to.equal(ethers.parseEther("1.0"));
    });

    it("Should revert if user tries to withdraw more than balance", async function () {
      const withdrawAmount = ethers.parseEther("3.0");
      
      await expect(wkaia.connect(user1).withdraw(withdrawAmount))
        .to.be.reverted;
    });

    it("Should allow withdrawing zero amount", async function () {
      const initialBalance = await wkaia.balanceOf(user1.address);
      
      await expect(wkaia.connect(user1).withdraw(0))
        .to.emit(wkaia, "Withdrawal")
        .withArgs(user1.address, 0);
      
      expect(await wkaia.balanceOf(user1.address)).to.equal(initialBalance);
    });
  });

  describe("Transfer", function () {
    beforeEach(async function () {
      await wkaia.connect(user1).deposit({ value: ethers.parseEther("2.0") });
    });

    it("Should transfer tokens between users", async function () {
      const transferAmount = ethers.parseEther("1.0");
      
      await expect(wkaia.connect(user1).transfer(user2.address, transferAmount))
        .to.emit(wkaia, "Transfer")
        .withArgs(user1.address, user2.address, transferAmount);
      
      expect(await wkaia.balanceOf(user1.address)).to.equal(ethers.parseEther("1.0"));
      expect(await wkaia.balanceOf(user2.address)).to.equal(transferAmount);
    });

    it("Should revert if user tries to transfer more than balance", async function () {
      const transferAmount = ethers.parseEther("3.0");
      
      await expect(wkaia.connect(user1).transfer(user2.address, transferAmount))
        .to.be.reverted;
    });

    it("Should handle transfer to zero address", async function () {
      const transferAmount = ethers.parseEther("1.0");
      
      await expect(wkaia.connect(user1).transfer(ethers.ZeroAddress, transferAmount))
        .to.emit(wkaia, "Transfer")
        .withArgs(user1.address, ethers.ZeroAddress, transferAmount);
    });
  });

  describe("Approve and TransferFrom", function () {
    beforeEach(async function () {
      await wkaia.connect(user1).deposit({ value: ethers.parseEther("2.0") });
    });

    it("Should approve spending and allow transferFrom", async function () {
      const approveAmount = ethers.parseEther("1.0");
      const transferAmount = ethers.parseEther("0.5");
      
      await expect(wkaia.connect(user1).approve(user2.address, approveAmount))
        .to.emit(wkaia, "Approval")
        .withArgs(user1.address, user2.address, approveAmount);
      
      expect(await wkaia.allowance(user1.address, user2.address)).to.equal(approveAmount);
      
      await expect(wkaia.connect(user2).transferFrom(user1.address, user3.address, transferAmount))
        .to.emit(wkaia, "Transfer")
        .withArgs(user1.address, user3.address, transferAmount);
      
      expect(await wkaia.balanceOf(user1.address)).to.equal(ethers.parseEther("1.5"));
      expect(await wkaia.balanceOf(user3.address)).to.equal(transferAmount);
      expect(await wkaia.allowance(user1.address, user2.address)).to.equal(ethers.parseEther("0.5"));
    });

    it("Should revert transferFrom if allowance is insufficient", async function () {
      const approveAmount = ethers.parseEther("0.5");
      const transferAmount = ethers.parseEther("1.0");
      
      await wkaia.connect(user1).approve(user2.address, approveAmount);
      
      await expect(wkaia.connect(user2).transferFrom(user1.address, user3.address, transferAmount))
        .to.be.reverted;
    });

    it("Should allow unlimited approval with max uint256", async function () {
      // Using uint256(-1) as per the contract implementation
      const maxApproval = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
      
      await wkaia.connect(user1).approve(user2.address, maxApproval);
      
      expect(await wkaia.allowance(user1.address, user2.address)).to.equal(maxApproval);
      
      // Should be able to transfer multiple times without reducing allowance
      await wkaia.connect(user2).transferFrom(user1.address, user3.address, ethers.parseEther("0.5"));
      await wkaia.connect(user2).transferFrom(user1.address, user3.address, ethers.parseEther("0.5"));
      
      expect(await wkaia.allowance(user1.address, user2.address)).to.equal(maxApproval);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very small amounts", async function () {
      const smallAmount = 1; // 1 wei
      
      await wkaia.connect(user1).deposit({ value: smallAmount });
      expect(await wkaia.balanceOf(user1.address)).to.equal(smallAmount);
      
      await wkaia.connect(user1).withdraw(smallAmount);
      expect(await wkaia.balanceOf(user1.address)).to.equal(0);
    });

    it("Should handle multiple users with different balances", async function () {
      await wkaia.connect(user1).deposit({ value: ethers.parseEther("1.0") });
      await wkaia.connect(user2).deposit({ value: ethers.parseEther("2.0") });
      await wkaia.connect(user3).deposit({ value: ethers.parseEther("0.5") });
      
      expect(await wkaia.totalSupply()).to.equal(ethers.parseEther("3.5"));
      expect(await wkaia.balanceOf(user1.address)).to.equal(ethers.parseEther("1.0"));
      expect(await wkaia.balanceOf(user2.address)).to.equal(ethers.parseEther("2.0"));
      expect(await wkaia.balanceOf(user3.address)).to.equal(ethers.parseEther("0.5"));
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for basic operations", async function () {
      const depositAmount = ethers.parseEther("1.0");
      
      const depositTx = await wkaia.connect(user1).deposit({ value: depositAmount });
      const depositReceipt = await depositTx.wait();
      
      // Deposit should use reasonable gas
      expect(depositReceipt.gasUsed).to.be.lessThan(100000);
      
      const transferTx = await wkaia.connect(user1).transfer(user2.address, ethers.parseEther("0.5"));
      const transferReceipt = await transferTx.wait();
      
      // Transfer should use reasonable gas
      expect(transferReceipt.gasUsed).to.be.lessThan(80000);
    });
  });
});
