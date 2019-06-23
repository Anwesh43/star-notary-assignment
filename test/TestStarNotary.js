const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    instance = await StarNotary.deployed()
    const differentTokenId = 23
    await instance.createStar("new star", differentTokenId, {from : accounts[0]})
    const name = await instance.name.call()
    const symbol = await instance.symbol.call()
    assert.equal(name, "StarNotaryApp")
    assert.equal(symbol, "SNTA")
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed
    instance = await StarNotary.deployed()
    const star1Name = "star1"
    const star2Name = "star2"
    const tokenId1 = 30
    const tokenId2 = 31
    const user1 = accounts[3]
    const user2 = accounts[4]
    await instance.createStar(star1Name, tokenId1, {from : user1})
    await instance.createStar(star2Name, tokenId2, {from : user2})
    const owner1 = await instance.ownerOf(tokenId1, {from : user1})
    const owner2 = await instance.ownerOf(tokenId2, {from : user1})
    assert.equal(owner1, user1)
    assert.equal(owner2, user2)
    await instance.exchangeStars(tokenId1, tokenId2, {from : user1})
    const newOwner1 = await instance.ownerOf(tokenId1, {from : user1})
    const newOwner2 = await instance.ownerOf(tokenId2, {from : user1})
    assert.equal(newOwner1, user2)
    assert.equal(newOwner2, user1)
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
    instance = await StarNotary.deployed()
    const user1 = accounts[1]
    const user2 = accounts[2]
    const tokenId = 40
    const starName = "transfer star"
    await instance.createStar(starName, tokenId, {from : user1})
    const ownwer = await instance.ownerOf(tokenId)
    await instance.transferStar(user2, tokenId, {from : user1})
    const newOwner = await instance.ownerOf(tokenId)
    assert.equal(newOwner, user2)
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    const tokenId = 34
    const originalStarName = "star1"
    instance = await StarNotary.deployed()
    await instance.createStar(originalStarName, tokenId)
    const starName = await instance.lookUptokenIdToStarInfo(tokenId)
    assert.equal(starName, originalStarName)
});
