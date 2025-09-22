import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function TitleForm() {
    return ( 
        <>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              AriNails
            </Typography>

            

            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Tu salón de belleza de confianza
            </Typography>
          </Box>
        </>
     );
}

export default TitleForm;