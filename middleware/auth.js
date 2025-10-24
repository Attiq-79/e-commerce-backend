import jwt from 'jsonwebtoken';
import User from "../models/user.model.js";

const auth = async(request,response,next)=>{
try {
   const token = 
    request.cookies?.accessToken || 
    (request.headers?.authorization && request.headers.authorization.split(" ")[1]);
 //bearer token
    console.log("token", token)
    if(!token){
        return response.status(401).json({
            message:'proive token',
            error:true,
            success:false
        })
    }
    
    const decode = jwt.verify(token,process.env.SECRET_KEY_ACCESS_TOKEN)
      if(!decode){
        return response.status(401).json({
            message:'unauthorization access',
            error:true,
            success:false
        })
    }
    request.userId = decode.id
   next()
} catch (error) {
    return response.status(500).json({
        message:error.message || error,
        error:true,
        success:false
    })
}
}

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

export default auth