export default function handler(req, res) {
  const tokenId = req.query.tokenId; 
  const imageUrl = "https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/" 
  res.status(200).json({
      name:"Steve #" + tokenId, 
      description: "This is a collection of Steve's NFTs", 
      image: imageUrl + tokenId + ".svg"
  }); 
}