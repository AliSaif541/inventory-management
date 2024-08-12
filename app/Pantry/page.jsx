'use client';

import { useState, useRef } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, Card, IconButton, InputAdornment } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Info as InfoIcon, Search as SearchIcon, FilterList as FilterListIcon, CameraAlt as CameraAltIcon } from '@mui/icons-material';
import { Camera } from 'react-camera-pro';
import { usePantry } from '../{components}/PantryProvider';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -60%)',
  width: '50%',
  minHeight: '375px',
  p: 4, 
  backgroundColor: 'white', 
  borderRadius: 2, 
  boxShadow: 1, 
  mx: 'auto', 
  mt: 4,
};

const cameraModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  height: '90%',
  bgcolor: '#212121',
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
};

function Home() {
  const { inventory, addItem, removeItem } = usePantry();
  const [open, setOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewDescription, setViewDescription] = useState('');
  const [viewCategory, setViewCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const camera = useRef(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleViewOpen = (description, category) => {
    setViewDescription(description || 'No description');
    setViewCategory(category);
    setViewOpen(true);
  };
  const handleViewClose = () => setViewOpen(false);

  const handleCameraOpen = () => setCameraOpen(true);
  const handleCameraClose = () => setCameraOpen(false);

  const handleTakePhoto = async () => {
    if (camera.current) {
      const photo = camera.current.takePhoto();
      setCapturedImage(photo);
      setCameraOpen(false);

      try {
        const response = await fetch('/api/classify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: photo }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { item_name, category, description } = await response.json();
        console.log('Classified data:', { item_name, category, description });

        await addItem(item_name, category, description);
      } catch (error) {
        console.error('Error classifying image:', error);
      }
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory ? item.category === filterCategory : true)
  );

  return (
    <Box
      width="100%"
      minHeight="100vh"
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      p={4}
      overflow={'auto'}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" color={'black'} sx={{ fontWeight: 'bold' }}>
            Add Item
          </Typography>
          <Stack spacing={2} mt={2}>
            <TextField
              id="outlined-basic"
              label="Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              InputLabelProps={{
                style: { color: 'black',},
              }}
              InputProps={{
                style: { color: 'black', borderRadius: '10px', height: '50px', alignItems: 'center' },
              }}
            />
            <TextField
              id="outlined-basic"
              label="Category"
              variant="outlined"
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              InputLabelProps={{
                style: { color: 'black' },
              }}
              InputProps={{
                style: { color: 'black', borderRadius: '10px', height: '50px', alignItems: 'center' },
              }}
            />
            <TextField
              id="outlined-basic"
              label="Description"
              variant="outlined"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              InputLabelProps={{
                style: { color: 'black' },
              }}
              InputProps={{
                style: { color: 'black', borderRadius: '10px', height: '50px', alignItems: 'center' },
              }}
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName, category, description);
                setItemName('');
                setCategory('');
                setDescription('');
                handleClose();
              }}
              sx={{ bgcolor: 'black', '&:hover': {bgcolor: '#000000'} }}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Stack>
          <Button
              variant="contained"
              onClick={() => {
                handleClose();
              }}
              sx={{ bgcolor: 'black', marginTop: '10px', '&:hover': {bgcolor: '#000000'} }}
            >
              Close
          </Button>
        </Box>
      </Modal>

      <Modal
        open={viewOpen}
        onClose={handleViewClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle} alignItems='center' justifyContent='center'>
          <Typography id="modal-modal-title" variant="h6" component="h2" color={'black'} sx={{ fontWeight: 'bold' }}>
            Item Details
          </Typography>
          <Typography variant="body1" mt={2}>
            <strong>Description:</strong> {viewDescription}
          </Typography>
          <Typography variant="body1">
            <strong>Category:</strong> {viewCategory}
          </Typography>
        </Box>
      </Modal>

      <Modal
        open={cameraOpen}
        onClose={handleCameraClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={cameraModalStyle}>
          <Camera ref={camera} />
          <Button
            variant="contained"
            onClick={handleTakePhoto}
            sx={{ mt: 2, bgcolor: 'black', '&:hover': {bgcolor: '#000000'} }}
            startIcon={<CameraAltIcon />}
          >
            Take Photo
          </Button>
        </Box>
      </Modal>

      <Box width="100%" maxWidth="1200px">
        <h1 className="text-[30px] text-start my-6">Pantry Dashboard</h1>
        <Stack direction="column" spacing={2} alignItems="start" justifyContent="start" gap={2} mb={4} sx={{ width: '100%', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.1)', borderRadius: '8px', padding: '20px' }} >
          <Stack direction="row" gap={2} alignItems="center" sx={{ width: '100%' }}>
            <Button
              variant="contained"
              onClick={handleOpen}
              sx={{ bgcolor: '#000000', '&:hover': {bgcolor: '#000000'}}}
              startIcon={<AddIcon />}
            >
              Add Item
            </Button>
            <Button
              variant="contained"
              onClick={handleCameraOpen}
              sx={{ bgcolor: '#000000', '&:hover': {bgcolor: '#000000'} }}
              startIcon={<CameraAltIcon />}
            >
              Scan Item
            </Button>
          </Stack>
          <Stack direction="row" gap={2} alignItems="center" sx={{ width: '100%', mt: 2 }}>
            <TextField
              id="search"
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                ),
                
              }}
              InputLabelProps={{
                sx: {
                  color: '#000000', 
                  
                },
              }}
              sx={{ width: '95%' }}
            />
          </Stack>
          <Stack direction="row" gap={2} alignItems="center" sx={{ width: '100%', mt: 2 }}>
            <TextField
              id="filter"
              label="Filter by Category"
              variant="outlined"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                ),
                
              }}
              InputLabelProps={{
                sx: {
                  color: '#000000', 
                  
                },
              }}
              sx={{ width: '95%' }}
            />
          </Stack>
        </Stack>
        <Stack justifyContent="center" sx={{ width: '100%', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.1)', borderRadius: '8px', padding: '20px' }} >
          <h1 className="text-[24px] text-start my-6">Pantry List</h1>
          <Stack direction="row" flexWrap="wrap" gap={2} justifyContent="center" >
            {filteredInventory.map((item) => (
              <Card key={item.name} sx={{ minWidth: 275, bgcolor: 'white', color: '#000000' }}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description || 'No description'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Category: {item.category || 'Uncategorized'}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={2}>
                    <Button
                      variant="contained"
                      onClick={() => handleViewOpen(item.description, item.category)}
                      sx={{ bgcolor: '#000000', '&:hover': {bgcolor: '#000000'} }}
                      startIcon={<InfoIcon />}
                    >
                      View Details
                    </Button>
                    <IconButton
                      onClick={() => removeItem(item.name)}
                      sx={{ bgcolor: '#000000', color: '#ffffff', '&:hover': {bgcolor: '#000000'} }}
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Box>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

export default Home;
