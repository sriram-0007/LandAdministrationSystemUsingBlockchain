// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;                             // versio of the solidity compiler im using..range mentioned here

interface LandAdministrationInterface
{

    function ownersOf(uint256 tokenId) external view returns(address[] memory);

    function shareOf(uint256 tokenId,address owner) external view returns(uint16);

    function transferFrom(address from, address to,uint256 tokenId,uint16 share) external payable;

    function isTransferable(uint256 tokenId) external view returns(bool);

    function setTransferable(uint256 tokenId, bool value) external payable;

    //event Transfer(address from,address to,uint256 tokenId,uint16 share);
    
}

contract LandAdministration  is LandAdministrationInterface
{
    address master;
    address govt;
    uint256 private count=1;


    mapping(uint256 => address[]) private realEstateOwners;
    mapping(uint256 => mapping(address => uint16)) private realEstateOwnersShare;
    mapping(uint256 => bool) private transferable;
    mapping(uint256 => bool) private token_posted;

    mapping(uint256 => land) private landDetails;
    mapping(address => person) private  personDetails;
    address[] private trustedMembers;
    land[] private lands;


    /////////////////////////////////////////////////////////////////////////////////////////// structures 
    struct person
    {
        address person;
        string name;
        uint256 aadharNumber;
        uint256 phoneNumber;
        string email;
    }
    struct land
    {
        string district;
        string taluk;
        string village;
        uint256 pattaNumber;
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    constructor()
    {
        master=msg.sender;
    }

/////////////////////////////////////////////////////////////////////////////////// //////////////////////////////////////Modifiers for authorization
    modifier isMaster() 
    {
        require(msg.sender==master,"sorry only the master can call this function");
        _;
    }
    modifier isGovt()
    {
        require(msg.sender==govt,"sorry only the govt can call this function");
        _;
    }

    function isTrustedMember(address who) private view returns(bool)
    {
        for(uint i=0;i<trustedMembers.length;i++)
        {
            if(trustedMembers[i]==who)
            {
                return true;
            }
        }
        return false;
    }
 /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////Basic functions
    function addGovt(address government) public isMaster
    {
        govt=government;
    }

    function ownersOf(uint256 tokenId) override public view returns(address[] memory)
    {
        return realEstateOwners[tokenId];
    }

    function shareOf(uint256 tokenId,address owner) override public view returns(uint16)
    {
        return realEstateOwnersShare[tokenId][owner];
    }

    function isOwner(uint256 tokenId,address owner) private view returns(bool)
    {
        address[] memory allOwners=realEstateOwners[tokenId];
        for(uint i=0;i<allOwners.length;i++)
        {
            if(allOwners[i]==owner)
            {
                return true;
            }
        }
        return false;
    }

    function isTransferable(uint256 tokenId) override public view returns(bool)
    {
        return transferable[tokenId];
    }

    function setTransferable(uint256 tokenId,bool value) isMaster public payable 
    {
        transferable[tokenId]=value;
    }

    function getIndexOfOwner(uint256 tokenId,address owner) private view returns(int)
    {
        for(uint i=0;i<realEstateOwners[tokenId].length;i++)
        {
            if(owner==realEstateOwners[tokenId][i])
            {
                return int(i);
            }
        }
        return -1;
    }
//////////////////////////////////////////////////////////////////////////////////////////////////// view functions

    function trustedMemberDetails(address who) isMaster public view returns(person memory)
    {
        return personDetails[who];
    }

    function registeredLandDetails(uint256 tokenId) public view returns(land memory)
    {
        
        return landDetails[tokenId];
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function addToRealEstateOwner(uint256 tokenId,address owner) private
    {
        if(!isOwner(tokenId,owner))
        {
            realEstateOwners[tokenId].push(owner);
        }  
    }
    function removeFromOwnersList(uint256 tokenId,address from) private 
    {
        if(shareOf(tokenId,from)==0)
        {
            int i=getIndexOfOwner(tokenId,from);
            if(i!=1)
            {
                delete realEstateOwners[tokenId][uint(i)];
            }
        }
    }
    function check_for_same(land memory land1,land memory land2) internal pure returns(bool)
    {
        bool value=keccak256(abi.encodePacked(land1.district)) == keccak256(abi.encodePacked(land2.district)) && 
        keccak256(abi.encodePacked(land1.taluk)) == keccak256(abi.encodePacked(land2.taluk)) &&
        keccak256(abi.encodePacked(land1.village)) == keccak256(abi.encodePacked(land2.village))&&
        keccak256(abi.encodePacked(land1.pattaNumber)) == keccak256(abi.encodePacked(land2.pattaNumber));
        return(value);
    }
    function doesLandExists(land memory a) private view returns(bool)
    {
        for(uint i=0;i<lands.length;i++)
        {
            if(check_for_same(a, lands[i])==true)
            {
                return true;
            }
        }
        return false;
    }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function mint(address to,string memory district,string memory taluk,string memory village,uint256 pattaNumber,uint16 share) public isMaster
    {
        if(isTrustedMember(to)==false)
        {
            revert notTrustedMember({who:to});
        }
        land memory l=land(district,taluk,village,pattaNumber);

        require(doesLandExists(l)==false,"sorry the land already exists");

        lands.push(l);
        landDetails[count]=l;
        transferable[count]=true;
        realEstateOwners[count].push(to);
        realEstateOwnersShare[count][to]=share;
        token_posted[count]=false;
        count=count+1;
    }
    function addtrustedmembers(address personi,string memory name,uint256 aadharNumber,uint256 phoneNumber,string memory email) public isMaster
    {
        person memory p=person(personi,name,aadharNumber,phoneNumber,email);
        trustedMembers.push(personi);
        personDetails[personi]=p;
    }

    function transferFrom(address from,address to,uint256 tokenId,uint16 share) override public payable
    {
        if(!transferable[tokenId])
        {
            revert nonTransferable({ tokenId: tokenId});
        }

        if(!(msg.sender== master || isOwner(tokenId,from)))
        {
            revert notOwnerOrMaster({ tokenId:tokenId, from:from});
        }

        if(shareOf(tokenId,from)<share)
        {
            revert notOwningBigEnoughShare({
                tokenId:tokenId,
                from:from,
                owningShare:shareOf(tokenId,from),
                transferingShare:share
            });
        }

        realEstateOwnersShare[tokenId][from]-=share;
        realEstateOwnersShare[tokenId][to]+=share;
        addToRealEstateOwner(tokenId,to);
        removeFromOwnersList(tokenId, from);
    }
    ////////////////////////////////////////////////////////////////////////// errors here /////////////////////
    error nonTransferable(uint256 tokenId);
    error notOwnerOrMaster(uint256 tokenId,address from);
    error notOwningBigEnoughShare(uint256 tokenId,address from,uint16 owningShare,uint16 transferingShare);
    error notTrustedMember(address who);

    //////////////////////////////////////////////////////////////////////////// now we are creating a posting platform
    
    function transferFromInside(address from,address to,uint256 tokenId,uint16 share) private 
    {
        realEstateOwnersShare[tokenId][from]-=share;
        realEstateOwnersShare[tokenId][to]+=share;
        addToRealEstateOwner(tokenId,to);
        removeFromOwnersList(tokenId, from);
    }
    function getOwnedTokensAndShares(address owner) public view returns (uint256[] memory tokenIds, uint16[] memory shares) {
        uint256 totalTokens = count - 1; // Since count is incremented after minting
        uint256 ownedCount = 0;

        // First, count how many tokens the owner has
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (realEstateOwnersShare[i][owner] > 0) {
                ownedCount++;
            }
        }

        // Initialize arrays to hold token IDs and shares
        tokenIds = new uint256[](ownedCount);
        shares = new uint16[](ownedCount);
        uint256 index = 0;

        // Populate the arrays with owned token IDs and shares
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (realEstateOwnersShare[i][owner] > 0) {
                tokenIds[index] = i;
                shares[index] = realEstateOwnersShare[i][owner];
                index++;
            }
        }
    }

    /////////////////////////////////// Improved Code
        // Mapping to check if a specific owner has already posted their share for a tokenId
    mapping(uint256 => mapping(address => bool)) public hasPosted;

    // Struct to store posted land info
    struct PeopleWhoPostedLandStruct {
        address seller;
        uint256 tokenId;
        uint16 share;
        uint256 amount;
    }

    // Array to store all posted land entries
    PeopleWhoPostedLandStruct[] public PeopleWhoPostedLand;

    function postLand(uint256 tokenId, uint256 amount, uint16 share) public {
    // 1. Check if the token is transferable
        if (!transferable[tokenId]) {
            revert nonTransferable({ tokenId: tokenId });
        }

        // 2. Check if the sender is an owner
        if (!isOwner(tokenId, msg.sender)) {
            revert notOwnerOrMaster({ tokenId: tokenId, from: msg.sender });
        }

        // 3. Check if the sender owns enough share
        uint16 ownedShare = shareOf(tokenId, msg.sender);
        if (ownedShare < share) {
            revert notOwningBigEnoughShare({
                tokenId: tokenId,
                from: msg.sender,
                owningShare: ownedShare,
                transferingShare: uint16(share)
            });
        }

        // 4. Check if the sender has already posted their share for this land
        if (hasPosted[tokenId][msg.sender]) {
            revert("You have already posted your share for this land");
        }

        // 5. Add the land post to the array
        PeopleWhoPostedLand.push(PeopleWhoPostedLandStruct({
            seller: msg.sender,
            tokenId: tokenId,
            share: share,
            amount: amount
        }));

        // 6. Mark this user as having posted for this land
        hasPosted[tokenId][msg.sender] = true;

        // 7. Mark the token as posted for sale
        token_posted[tokenId] = true;
    }
    function buyLand(uint256 tokenId, address seller) public payable {
        require(token_posted[tokenId], "This land is not for sale");

        // 1. Check if buyer is a trusted member
        bool isTrusted = false;
        for (uint i = 0; i < trustedMembers.length; i++) {
            if (trustedMembers[i] == msg.sender) {
                isTrusted = true;
                break;
            }
        }
        require(isTrusted, "Only trusted members can buy land");

        // 2. Locate the specific land post
        uint index = PeopleWhoPostedLand.length;
        for (uint i = 0; i < PeopleWhoPostedLand.length; i++) {
            if (
                PeopleWhoPostedLand[i].tokenId == tokenId &&
                PeopleWhoPostedLand[i].seller == seller
            ) {
                index = i;
                break;
            }
        }
        require(index < PeopleWhoPostedLand.length, "Land post not found");

        PeopleWhoPostedLandStruct memory post = PeopleWhoPostedLand[index];

        // 3. Validate payment amount
        require(msg.value >= post.amount, "Incorrect ETH amount sent");

        // 4. Transfer ETH to the seller
        payable(post.seller).transfer(msg.value);

        // 5. Update ownership shares
        require(realEstateOwnersShare[tokenId][post.seller] >= post.share, "Seller does not have enough share");
        realEstateOwnersShare[tokenId][post.seller] -= uint16(post.share);
        realEstateOwnersShare[tokenId][msg.sender] += uint16(post.share);

        // 6. Add buyer to owners list if not already there
        bool buyerAlreadyExists = false;
        for (uint i = 0; i < realEstateOwners[tokenId].length; i++) {
            if (realEstateOwners[tokenId][i] == msg.sender) {
                buyerAlreadyExists = true;
                break;
            }
        }
        if (!buyerAlreadyExists) {
            realEstateOwners[tokenId].push(msg.sender);
        }

        // 7. Remove the sold post from the array
        PeopleWhoPostedLand[index] = PeopleWhoPostedLand[PeopleWhoPostedLand.length - 1];
        PeopleWhoPostedLand.pop();

        // 8. Mark the seller as not having posted
        hasPosted[tokenId][post.seller] = false;

        // 9. Check if there are still other shares posted for this land
        bool stillPosted = false;
        for (uint i = 0; i < PeopleWhoPostedLand.length; i++) {
            if (PeopleWhoPostedLand[i].tokenId == tokenId) {
                stillPosted = true;
                break;
            }
        }
        if (!stillPosted) {
            token_posted[tokenId] = false;
        }
    }


    function getPostedLandDetails() public view returns (PeopleWhoPostedLandStruct[] memory) {
    return PeopleWhoPostedLand;
    }
    function getTotalToken()public view returns(uint){
        return count;
    }
    


    function checkIfTrusted(address who) public view returns (bool) {
    return isTrustedMember(who);
    
}



}