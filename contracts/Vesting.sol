pragma solidity 0.4.24;

import "./ERC20.sol";

contract Vesting {

    using SafeMath for uint256;

    ERC20 public mycroToken;

    event LogFreezedTokensToInvestor(address _investorAddress, uint256 _tokenAmount, uint256 _daysToFreeze);
    event LogUpdatedTokensToInvestor(address _investorAddress, uint256 _tokenAmount);
    event LogWithdraw(address _investorAddress, uint256 _tokenAmount);

    constructor(address _token) public {
        mycroToken = ERC20(_token);
    }

    mapping (address => Investor) public investors;

    struct Investor {
        uint256 tokenAmount;
        uint256 frozenPeriod;
        bool isInvestor;
    }


    /**
        @param _investorAddress the address of the investor
        @param _tokenAmount the amount of tokens an investor will receive
        @param _daysToFreeze the number of the days token would be freezed to withrow, e.c. 3 => 3 days
     */
    function freezeTokensToInvestor(address _investorAddress, uint256 _tokenAmount, uint256 _daysToFreeze) public returns (bool) {
        require(_investorAddress != address(0));
        require(_tokenAmount != 0);
        require(!investors[_investorAddress].isInvestor);

        _daysToFreeze = _daysToFreeze.mul(1 days); // converts days into seconds
        
        investors[_investorAddress] = Investor({tokenAmount: _tokenAmount, frozenPeriod: now.add(_daysToFreeze), isInvestor: true});
        
        require(mycroToken.transferFrom(msg.sender, address(this), _tokenAmount));
        emit LogFreezedTokensToInvestor(_investorAddress, _tokenAmount, _daysToFreeze);

        return true;
    }

     function updateTokensToInvestor(address _investorAddress, uint256 _tokenAmount) public returns(bool) {
        require(investors[_investorAddress].isInvestor);
        Investor storage currentInvestor = investors[_investorAddress];
        currentInvestor.tokenAmount = currentInvestor.tokenAmount.add(_tokenAmount);

        require(mycroToken.transferFrom(msg.sender, address(this), _tokenAmount));
        emit LogUpdatedTokensToInvestor(_investorAddress, _tokenAmount);
    }

    function withdraw(uint256 _tokenAmount) public {
        address investorAddress = msg.sender;
        Investor storage currentInvestor = investors[investorAddress];
        
        require(currentInvestor.isInvestor);
        require(now >= currentInvestor.frozenPeriod);
        require(_tokenAmount <= currentInvestor.tokenAmount);

        currentInvestor.tokenAmount = currentInvestor.tokenAmount.sub(_tokenAmount);
        require(mycroToken.transfer(investorAddress, _tokenAmount));
        emit LogWithdraw(investorAddress, _tokenAmount);
    }



}