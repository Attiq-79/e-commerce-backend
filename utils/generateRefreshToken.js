import userModel from "../models/user.model.js"
import jwt from 'jsonwebtoken';

const generateRefreshToken = async (userId)=>{
   
       const token = jwt.sign({id : userId},
        process.env.SECRET_KEY_REFRESG_TOKEN,
        {expiresIn:'24h'})

        const updateRefreshToken = await userModel.updateOne(
            {
            _id : userId
            },
            {
              refresh_token : token 
            }
    )
       return token
}
export default generateRefreshToken;