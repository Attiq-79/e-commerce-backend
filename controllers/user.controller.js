import sendEmail from "../config/sendEmail.js";
import userModel from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import verifyEmailtemplate from "../utils/verifyEmailTemplate.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import uploadImageClodinary from "../utils/uploadImageClodinary.js";
import generateOtp from "../utils/generateOpt.js";
import forgotPasswordTemplate from "../utils/forgotPasswordTemplate.js";
import jwt from 'jsonwebtoken';

export async function registerUserController(request, response) {
    try {
        const { name, email, password } = request.body

        if (!name, !email, !password) {
            return response.status(400).json({
                message: "provide name, email,and password",
                error: true,
                success: false
            })
        }

        const user = await userModel.findOne({ email })
        if (user) {
            return response.json({
                message: "Already register email",
                error: true,
                success: false
            })
        }
        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(password, salt)

        const payload = {
            name,
            email,
            password: hashPassword
        }
        const newUser = new userModel(payload)
        const save = await newUser.save()

        const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`

        const verifyEmail = await sendEmail({
            sendTo: email,
            subject: "verify email from binkeyit",
            html: verifyEmailtemplate({
                name,
                url: VerifyEmailUrl
            })
        })
        response.json({
            message: 'user register successfully',
            error: false,
            success: true,
            data: save
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function verifyEmailController(request, response) {
    try {
        const { code } = request.body
        const user = await userModel.findOne({ _id: code })

        if (!user) {
            return response.status(400).json({
                message: "invalid code",
                error: true,
                success: false
            })
        }

        const updateUser = await userModel.updateOne({ _id: code }, {
            verify_email: true
        })
        return response.json({
            message: "verification email done",
            success: true,
            error: false
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: true
        })
    }
}

//user login 
export async function loginController(request, response) {
    try {
        const { email, password } = request.body
        if (!email || !password) {
            return response.status(400).json({
                message: "provide email and password",
                error: true,
                success: false
            })
        }
        const user = await userModel.findOne({ email })

        if (!user) {
            return response.status(400).json({
                message: "user not register",
                error: true,
                success: false
            })
        }

        if (user.status !== "Active") {
            return response.status(400).json({
                message: "contact to admin",
                error: true,
                success: false
            })
        }
        const checkPassword = await bcryptjs.compare(password, user.password)

        if (!checkPassword) {
            return response.status(400).json({
                message: "check your password",
                error: true,
                success: false
            })
        }

        const accessToken = await generateAccessToken(user._id)
        const refreshToken = await generateRefreshToken(user._id)

        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        }
        response.cookie('accessToken', accessToken, cookieOption)
        response.cookie('refreshToken', refreshToken, cookieOption)

        return response.json({
            message: 'Login Successfully',
            error: false,
            success: true,
            data: {
                accessToken,
                refreshToken
            }
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//logout controller

export async function logoutController(request, response) {
    try {
        const userid = request.userId //coming from middleware
        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        }
        response.clearCookie("accessToken", cookieOption)
        response.clearCookie("refreshToken", cookieOption)

        const removeRefreshToken = await userModel.findByIdAndUpdate(userid, {
            refresh_token: ""
        })

        return response.json({
            message: "logout successfully",
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//upload user avater

export async function uploadAvater(request, response) {
    try {
        const userId = request.userId
        const image = request.file
        const upload = await uploadImageClodinary(image)

        const updateUser = await userModel.findByIdAndUpdate(userId, {
            avatar: upload.url
        })
        return response.json({
            message: 'image uploaded successfully',
            data: {
                _id: userId,
                avatar: upload.url
            }
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//update user detaile

export async function updateUserDetails(request, response) {
    try {
        const userId = request.userId
        const { name, email, password, mobile } = request.body
        // let hashPassword = ""
        // if (password) {
        //     const salt = await bcryptjs.genSalt(10)
        //     hashPassword = await bcryptjs.hash(password, salt)
        // }
        const updateUser = await userModel.updateOne({ _id: userId }, {
            ...(name && { name: name }),
            // ...(email && { email: email }),
            ...(mobile && { mobile: mobile }),
            // ...(password && { password: hashPassword }),
        })
        return response.json({
            message: "updated user ",
            error: false,
            success: true,
            data: updateUser
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//Forgot Password not Login
export async function forgotPasswordController(req, res) {
    try {
        const { email } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({
                message: "Email is required",
                error: true,
                success: false,
            });
        }

        // Find user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        // Generate OTP & Expiry
        const otp = generateOtp();
        const expireTime = Date.now() + 60 * 60 * 1000; // 1 hour

        // Save to DB
        await userModel.findByIdAndUpdate(user._id, {
            forgot_password_otp: otp,
            forgot_password_expire: new Date(expireTime).toISOString(),
        });

        // Send Email
        await sendEmail({
            sendTo: email,
            subject: "Forgot Password - My Binkeyit",
            html: forgotPasswordTemplate({
                name: user.name,
                otp,
            }),
        });

        return res.json({
            message: "OTP sent to your email",
            error: false,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false,
        });
    }
}

//verify forgot Password otp

export async function verifyForgotPasswordOtp(request, response) {
    try {
        const { email, otp } = request.body
        if (!email || !otp) {
            return response.status(400).json({
                message: 'provide required field email, otp',
                error: true,
                success: false
            })
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }
        const currentTime = new Date()
        if (user.forgot_password_expire < currentTime) {
            return response.status(400).json({
                message: 'otp is expire',
                error: true,
                success: false
            })
        }
        if (otp !== user.forgot_password_otp) {
            return response.status(400).json({
                message: 'invalid otp',
                error: true,
                success: false
            })
        }
        //if otp is not expire
        // otp === user.forgot_password_otp
        return response.json({
            message: 'verify otp successfuly',
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false,
        });
    }
}

//reset the password 

export async function resetPassword(request, response) {
    try {
        const { email, newPassword, confirmPassword } = request.body
        if (!email || !newPassword || !confirmPassword) {
            return response.status(400).json({
                message: 'provide required fields email,password,new password, confirm password',

            })
        }
        const user = await userModel.findOne({ email })
        if (!user) {
            return response.status(400).json({
                message: 'email is not avalible',
                error: true,
                success: false
            })
        }
        if(newPassword !== confirmPassword){
            return response.status(400).json({
                message:'newPassword and confirPasssword is not same',
                error:true,
                success:false
            })
        }
         const salt = await bcryptjs.genSalt(10)
          const  hashPassword = await bcryptjs.hash(newPassword, salt)

        const update = await userModel.findByIdAndUpdate(user._id,{
           password:hashPassword
        })
        return response.json({
            message:'password updated successfully',
            error:false,
            success:true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false,
        });
    }
}

//refresh token controller

export async function refreshToken(request, response) {
  try {
    // 🔹 Get refresh token from cookie or headers
    const refreshToken =
      request.cookies?.refreshToken ||
      request.headers?.authorization?.split(" ")[1];

    if (!refreshToken) {
      return response.status(400).json({
        message: "Invalid or missing refresh token",
        error: true,
        success: false,
      });
    }

    // 🔹 Verify refresh token
    const verifyToken = jwt.verify(
      refreshToken,
      process.env.SECRET_KEY_REFRESG_TOKEN
    );

    if (!verifyToken) {
      return response.status(401).json({
        message: "Refresh token is expired or invalid",
        error: true,
        success: false,
      });
    }

    console.log("Verified token:", verifyToken);

    const userId = verifyToken?._id || verifyToken?.id;

    // 🔹 Generate new access token
    const newAccessToken = generateAccessToken(userId);

    const cookieOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    // 🔹 Set cookie with new access token
    response.cookie("accessToken", newAccessToken, cookieOption);

    return response.json({
      message: "New access token generated",
      error: false,
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
}