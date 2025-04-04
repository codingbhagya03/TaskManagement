const express = require('express');
const router = express.Router();
const EmployeeModel = require('../models/Employee');
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config();

// Set up SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

console.log("SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "Exists (starts with " + process.env.SENDGRID_API_KEY.substring(0, 5) + "...)" : "Not found");
// Generate a 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP for password reset
router.post('/send-reset-otp', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        console.log(`Attempting to find user with email: ${email}`);
        // Find the user with the provided email
        const user = await EmployeeModel.findOne({ email });
        if (!user) {
            console.log(`User not found with email: ${email}`);
            return res.status(404).json({ message: 'User not found with this email' });
        }
        
        console.log(`User found: ${user._id}`);
        // Generate OTP
        const otp = generateOTP();
        console.log(`Generated OTP: ${otp}`);
        
        // Set OTP expiration time (10 minutes from now)
        const otpExpires = new Date();
        otpExpires.setMinutes(otpExpires.getMinutes() + 10);
        
        // Save OTP to user record
        user.resetOTP = otp;
        user.resetOTPExpires = otpExpires;
        console.log('Saving OTP to user record...');
        await user.save();
        console.log('OTP saved successfully');
        
        try {
            console.log('Attempting to send email...');
            
            // SendGrid email configuration
            const msg = {
                to: email,
                from: process.env.SENDGRID_FROM_EMAIL, // Your verified sender email in SendGrid
                subject: 'Password Reset OTP for Tasky',
                text: `Your OTP for password reset is: ${otp}. This OTP will expire in 10 minutes.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
                        <h2 style="color: #333; text-align: center;">TASK<span style="color: #eab308;">Y.</span> Password Reset</h2>
                        <p>Hello,</p>
                        <p>We received a request to reset your password. Please use the following OTP code to continue:</p>
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0;">
                            <h1 style="color: #333; font-size: 24px; margin: 0;">${otp}</h1>
                        </div>
                        <p><strong>Note:</strong> This OTP will expire in 10 minutes.</p>
                        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                        <p>Thanks,<br>The Tasky Team</p>
                    </div>
                `
            };
            
            const result = await sgMail.send(msg);
            console.log('Email sent successfully via SendGrid');
            
            return res.status(200).json({ 
                message: 'OTP sent to your email',
                messageId: result[0]?.headers['x-message-id'] || 'sent' 
            });
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            
            // DEVELOPMENT FALLBACK: Log OTP to console for testing
            console.log(`*** DEVELOPMENT FALLBACK: OTP for ${email} is ${otp} ***`);
            
            // For production, you would want to return an error
            // return res.status(500).json({ 
            //     message: 'Failed to send email',
            //     error: emailError.message
            // });
            
            // For development, return success anyway so you can test the flow
            return res.status(200).json({
                message: 'OTP generated (check server console)',
                devNote: 'Email sending failed, but OTP is logged to server console for development'
            });
        }
    } catch (error) {
        console.error('Send OTP detailed error:', error);
        console.error('Error stack:', error.stack);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                details: error.message 
            });
        }
        
        return res.status(500).json({ 
            message: 'Server error. Please try again later.',
            details: error.message
        });
    }
});

// Verify OTP
router.post('/verify-reset-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // Find user with matching email and valid OTP
        const user = await EmployeeModel.findOne({
            email,
            resetOTP: otp,
            resetOTPExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        return res.status(200).json({ message: 'OTP verified successfully' });

    } catch (error) {
        console.error('Verify OTP error:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Reset password with OTP
router.post('/reset-password-with-otp', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Find user with matching email and valid OTP
        const user = await EmployeeModel.findOne({
            email,
            resetOTP: otp,
            resetOTPExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Update password
        user.password = newPassword;

        // Clear OTP fields
        user.resetOTP = undefined;
        user.resetOTPExpires = undefined;
        await user.save();

        return res.status(200).json({ message: 'Password reset successful' });

    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

module.exports = router;