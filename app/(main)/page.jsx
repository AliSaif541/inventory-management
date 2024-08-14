import { Box, Button, Stack, Typography } from "@mui/material";
import PantryImg from '../../public/pantry-img.webp';
import Image from "next/image";
import Link from "next/link";

const Home = () => {
    return (
        <Box width='100%'>
            <Stack 
            flex 
            flexDirection="row" 
            height="89vh" 
            justifyContent="space-between"
            sx={{
                '@media (max-width: 740px)': {
                  flexDirection: "column"
                }
            }}
            >
                <Stack 
                justifyContent="center" 
                alignItems='center' 
                width="60%" 
                sx={{
                    '@media (max-width: 740px)': {
                        width: "100%",
                        textAlign: 'center',
                        padding: '20px'
                    }
                }}
                >
                    <Stack 
                    justifyContent='start'
                    alignItems='center' 
                    width="80%" 
                    sx={{
                        '@media (max-width: 740px)': {
                            justifyContent: 'center',
                            width: "100%" 
                        }
                    }}
                    >
                        <Typography variant="h4" mb={3} fontStyle='bold' sx={{ fontWeight: 'bold', alignSelf: 'flex-start' }} >
                            Effortlessly Track Your Pantry
                        </Typography>
                        <Typography variant="body1" mb={3}>
                            Elevate your pantry game with our all-in-one Pantry Management System! Effortlessly add or remove items with a user-friendly dashboard. Get personalized recipe suggestions and expert tips from our AI chatbot. Experience smarter pantry management—try it today!                        
                        </Typography>
                        <Button sx={{alignSelf: 'flex-start', '@media (max-width: 740px)': {alignSelf: 'center'}, backgroundColor: 'blue', color: 'white', width: '75px', '&:hover': {bgcolor: 'blue', boxShadow: '8px 8px 10px rgba(0, 0, 0, 0.1)'} }}>
                            <Link href="/api/auth/signin?callbackUrl=/Pantry">Login</Link>
                        </Button>
                    </Stack>
                </Stack>
                <Stack 
                flex 
                flexDirection="column" 
                justifyContent="center" 
                alignItems="center" 
                width="40%" 
                sx={{
                    '@media (max-width: 740px)': {
                      width: "100%"
                    }
                }}
                >
                    <Image 
                    src={PantryImg} 
                    alt="Pantry Image" 
                    style={{ 
                        height: '80%', 
                        width: '90%'
                    }} 
                    />
                </Stack>
            </Stack>
        </Box>
    )
}

export default Home;