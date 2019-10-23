const mycro = artifacts.require('mycro.sol');
const Vesting = artifacts.require('Vesting.sol');
const { increaseTimeTo, duration } = require('openzeppelin-solidity/test/helpers/increaseTime');
const { latestTime } = require('openzeppelin-solidity/test/helpers/latestTime');
var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

contract('mycro Token Contract', async (accounts) => {

  it('Should correctly initialize constructor values of mycro Token Contract', async () => {
    
    this.tokenhold = await mycro.new(accounts[0],{from : accounts[0], gas: 60000000 });
  
  });

  it('Should correctly initialize constructor values of Vesting Token Contract', async () => {
    
    this.Vestinghold = await Vesting.new(this.tokenhold.address,{from : accounts[0], gas: 60000000 });
  
  });

    it('Should check the Total Supply of mycro Tokens ', async () => {


    let totalSupply = await this.tokenhold.totalTokens();
    assert.equal(totalSupply/10**18,1000000000); 
    });
  
    it('Should check the Name of a token of mycro contract', async () => {
  
      let name = await this.tokenhold.name();
      assert.equal(name,'mycro'); 
  
    });
  
    it('Should check the symbol of a token of mycro contract', async () => {
  
      let symbol = await this.tokenhold.symbol();
      assert.equal(symbol,'mycro'); 
  
    });
  
    it('Should check the decimal of a token of mycro contract', async () => {
  
      let decimal = await this.tokenhold.decimals();
      assert.equal(decimal.toNumber(),18); 
  
    });
  
    it('Should check the Owner of a contract', async () => {
  
      let owner = await this.tokenhold.owner();
      assert.equal(owner,accounts[0]);; 
      this.openingTime = (await latestTime());
      await increaseTimeTo(this.openingTime + duration.seconds(15552000));
    });

    it('Should check the Owner balance of a contract', async () => {
  
    var ownerBalance = await this.tokenhold.balanceOf.call(accounts[0]);
    assert.equal(ownerBalance.toNumber()/10**18,1000000000); 
  
    });

  it("should Approve Vesting contract to vest specific token ", async () => {

    let allownaces = await this.tokenhold.allowance.call(accounts[0],this.Vestinghold.address);
    assert.equal(allownaces.toNumber(),0, "allowance is wrong when approve");
    var ownerBalance = await this.tokenhold.balanceOf.call(accounts[0]);
    assert.equal(ownerBalance.toNumber()/10**18,1000000000);
    this.tokenhold.approve(this.Vestinghold.address,1000000000*10**18 , { from: accounts[0] });
    let allowanceLater = await this.tokenhold.allowance.call(accounts[0],this.Vestinghold.address);
    assert.equal(allowanceLater.toNumber()/10**18, 1000000000, "allowance is wrong when approve");

  });

  it("should check investor is not previously vested ", async () => {

    let checkPreviousInvestor = await this.Vestinghold.investors.call(accounts[1]);
    assert.equal(checkPreviousInvestor[2],false);

  });

  it("should check investor is not previously vested ", async () => {

    let checkPreviousInvestor = await this.Vestinghold.investors.call(accounts[1]);
    assert.equal(checkPreviousInvestor[2],false);

  });

  it("should check mycro contract address ", async () => {

    let contrsactAddress = await this.Vestinghold.mycroToken.call();
    assert.equal(contrsactAddress,this.tokenhold.address);

  });

  it("should vest mycro token by owner ", async () => {

    let checkPreviousInvestor = await this.Vestinghold.investors.call(accounts[1]);
    assert.equal(checkPreviousInvestor[2],false);
    await this.Vestinghold.freezeTokensToInvestor(accounts[1],10*10**18,5);
    let checkPreviousInvestorTrueNow = await this.Vestinghold.investors.call(accounts[1]);
    assert.equal(checkPreviousInvestorTrueNow[2],true);
  });

  it("should check investor is previously vested ", async () => {

    let checkPreviousInvestor = await this.Vestinghold.investors.call(accounts[1]);
    assert.equal(checkPreviousInvestor[2],true);

  });

  it("should check investor's vested Amount ", async () => {

    let amount = await this.Vestinghold.investors.call(accounts[1]);
    assert.equal(amount[0]/10**18,10);

  });

  it("should check investor's vested period ", async () => {

    let period = await this.Vestinghold.investors.call(accounts[1]);

  });

  it("should Not be able to withdraw after vesting period is over more amount then vested", async () => {

  try{
    this.openingTime = (await latestTime());
    await increaseTimeTo(this.openingTime + duration.seconds(518400));
    await this.Vestinghold.withdraw(100*10**18,{from:accounts[1]});
  }catch(error){
    var error_ = 'VM Exception while processing transaction: revert';
    assert.equal(error.message, error_, 'Reverted ');
  }

 
  });

  it("should be able to withdraw after vesting period is over ", async () => {

    this.openingTime = (await latestTime());
    await increaseTimeTo(this.openingTime + duration.seconds(518400));
    await this.Vestinghold.withdraw(10*10**18,{from:accounts[1]});
    var ownerBalance = await this.tokenhold.balanceOf.call(accounts[1]);
    assert.equal(ownerBalance.toNumber()/10**18,10);
 
  });  

  it("should vest mycro token by owner ", async () => {

    let checkPreviousInvestor = await this.Vestinghold.investors.call(accounts[2]);
    assert.equal(checkPreviousInvestor[2],false);
    await this.Vestinghold.freezeTokensToInvestor(accounts[2],10*10**18,5);
    let checkPreviousInvestorTrueNow = await this.Vestinghold.investors.call(accounts[2]);
    assert.equal(checkPreviousInvestorTrueNow[2],true);
  });

  it("should check investor is previously vested ", async () => {

    let checkPreviousInvestor = await this.Vestinghold.investors.call(accounts[2]);
    assert.equal(checkPreviousInvestor[2],true);

  });

  it("should check investor's vested Amount ", async () => {

    let amount = await this.Vestinghold.investors.call(accounts[2]);
    assert.equal(amount[0]/10**18,10);

  });

  it("should check investor's vested period ", async () => {

    let period = await this.Vestinghold.investors.call(accounts[2]);

  });

  it("should Not be able to withdraw again vesting Amount ", async () => {

try{
  this.openingTime = (await latestTime());
  await increaseTimeTo(this.openingTime + duration.seconds(518400));
  await this.Vestinghold.withdraw(10*10**18,{from:accounts[1]});
}catch(error){
  var error_ = 'VM Exception while processing transaction: revert';
  assert.equal(error.message, error_, 'Reverted ');
}
});

it("should vest More mycro token by owner ", async () => {

  let checkPreviousInvestor = await this.Vestinghold.investors.call(accounts[2]);
  assert.equal(checkPreviousInvestor[2],true);
  await this.Vestinghold.updateTokensToInvestor(accounts[2],10*10**18);

});

it("should be able to withdraw after vesting period is over ", async () => {

  this.openingTime = (await latestTime());
  await increaseTimeTo(this.openingTime + duration.seconds(518400));
  await this.Vestinghold.withdraw(20*10**18,{from:accounts[2]});
  var ownerBalance = await this.tokenhold.balanceOf.call(accounts[2]);
  assert.equal(ownerBalance.toNumber()/10**18,20);

});

})


