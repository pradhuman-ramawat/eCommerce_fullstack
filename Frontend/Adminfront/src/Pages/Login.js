import React, {useState} from 'react';
import { Avatar, Button, TextField, Grid, Box, Typography, Container, Link, Alert, Stack } from '@mui/material' 
import { ThemeProvider } from '@mui/system';
import LockIcon from '@mui/icons-material/Lock';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import StoreTheme from '../themes/StoreTheme';
import GoogleIcon from '../icons/GoogleIcon';
import { authLogout } from '../services/Functions/AuthFunc';
import { logout } from '../features/user';
import { requiredField, emailValid} from '../services/Functions/ValidFunc';
import { authGoogleSignIn, authSignInWithEmail } from '../services/Functions/AuthFunc';
import { ErrorFunc } from '../services/Functions/ErrorFunc';
import axios from 'axios';

//! if logged in already , disable login button


export default function Login() {
    let navigate = useNavigate();
    const dispatch = useDispatch();

    const [email, setEmail] = useState('');
    const [emailErr, setEmailErr] = useState(false);
    const [pass, setPass] = useState('');
    const [passErr, setPassErr] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    let baseURL = process.env.REACT_APP_BACK_URL

    // const goBack = () => {
    //     navigate('/dash',  {replace:true})
    // }
    
    const handleEmail = e => setEmail(e.target.value);
    const handlePass = e => setPass(e.target.value);

    async function handleSubmit (event) {
        event.preventDefault();
        setError('')
        setEmailErr(false)
        setLoading(false)
        setPassErr(false)
        if ((emailValid(email) !== 'ok' || requiredField(email) === 'Required')&&requiredField(pass)==='Required'){
            return (
                setError('Enter a valid email and password'),
                setEmailErr(true),
                setPassErr(true)
            )
        }
        if (emailValid(email) !== 'ok' || requiredField(email) === 'Required'){
            return (
                setError('Enter a valid email'),
                setEmailErr(true)
            )
        }
        if(requiredField(pass)==='Required'){
            return(
                setError('Enter a password'),
                setPassErr(true)
            )
        }
        try{
            setError('')
            setLoading(true)
            await authSignInWithEmail(email, pass).then(
                (resp)=>{
                const user = resp.user;
                if(user.emailVerified===true){
                    user.getIdToken().then((token)=>{
                        localStorage.setItem("userToken", token)
                    }).then(()=>{
                        //apply send email logic here
                        navigate("/dash")
                    })
                }
                else{
                    authLogout().then(()=>{
                        dispatch(logout())
                    }).catch((err)=>console.log("LOGOUT ERR", err.message));
                    setError(`User not verified, check  ${user.email} for verification link to continue.`)
                    // navigate("/store", {replace:true})
                }
            }).catch((err)=>{
                setLoading(false);
                ErrorFunc(err, setError, setEmailErr, setPassErr);
            })
            }
            catch{
            setLoading(false);
            setError("Failed to log in, try again!")
        } 
    };

    const googleSubmit = () => {
        setLoading(true)
        authGoogleSignIn().then((resp)=>{
            const user = resp.user;
                user.getIdToken().then((token)=>{
                    localStorage.setItem("userToken", token)
                    axios({
                        url:`${baseURL}/auth/gsignup`,
                        headers:{
                            "X-Requested-With": "XMLHttpRequest",
                            "Authorization": `Bearer ${token}`
                        },
                        method:"POST"
                    }).then((res)=>{
                        setLoading(true)
                        if(res.status === 401){
                            setError("Failed to log in, you are unauthorized!")
                        }
                        navigate("/", {replace:true})
                    })
                    .catch((err)=>{
                        authLogout().then(()=>{
                            dispatch(logout())
                        }).catch((err)=>console.log("LOGOUT ERR", err.message));
                        setLoading(false);
                        setError("Failed to log in, try again!")
                    })
                })
        })
    }

return (
    <ThemeProvider theme={StoreTheme}>
        {/* <Fab onClick={goBack} color="primary" size="small" aria-label="back"  sx={{mt:1, ml:1, display:{xs:'flex', sm:'none'}}} >
            <CloseIcon />
        </Fab> */}
        {/* </Link> */}
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    <LockIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                <Typography component="h2" variant="body2">
                    Balaji Nursey & Farms Admin Panel
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        autoComplete='email'
                        fullWidth
                        value={email}
                        onChange={handleEmail}
                        error={emailErr}
                        id="email"
                        label="Email Address"
                        helperText={emailErr && 'Enter a valid email'}
                    />
                    <TextField
                        margin="normal"
                        autoComplete='current-password'
                        fullWidth
                        type="password"
                        value={pass}
                        onChange={handlePass}
                        error={passErr}
                        id="password"
                        label="Password"
                        helperText={passErr && "Enter a valid password"}
                    />
                    {error &&
                        <Grid item xs={12}>
                            <Alert severity='error'>{error}</Alert>
                        </Grid>
                    }
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        Sign In
                    </Button>
                    <Stack spacing={1} sx={{width:'100%', alignItems:'center'}}>
                        <Typography component="h6" variant="button">
                            OR
                        </Typography>
                        <Button
                        endIcon={<GoogleIcon/>}
                        fullWidth
                        onClick={googleSubmit}
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                        >
                            Continue With Google
                        </Button>
                        <Grid container alignContent="flex-end" flexDirection='column'>
                            <Grid item>
                                <Link component={RouterLink} to="/reset">
                                    Forgot password?
                                </Link>
                            </Grid>
                            <Grid item>
                                {/* <Link component={RouterLink} to="/signup">
                                    {"New User? Sign Up"}
                                </Link> */}
                            </Grid>
                        </Grid>
                    </Stack>
                </Box>
            </Box>
        </Container>
    </ThemeProvider>
);
}