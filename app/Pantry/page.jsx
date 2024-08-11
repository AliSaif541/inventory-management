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
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#212121',
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
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
      width="100vw"
      height="100vh"
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      p={4}
      bgcolor={'#212121'}
      color={'#ffffff'}
      overflow={'auto'}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" color={'#aa00ff'} sx={{ fontWeight: 'bold' }}>
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
                style: { color: '#ffffff' },
              }}
              InputProps={{
                style: { color: '#ffffff' },
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
                style: { color: '#ffffff' },
              }}
              InputProps={{
                style: { color: '#ffffff' },
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
                style: { color: '#ffffff' },
              }}
              InputProps={{
                style: { color: '#ffffff' },
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
              sx={{ bgcolor: '#aa00ff' }}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={viewOpen}
        onClose={handleViewClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" color={'#aa00ff'} sx={{ fontWeight: 'bold' }}>
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
            sx={{ mt: 2, bgcolor: '#aa00ff' }}
            startIcon={<CameraAltIcon />}
          >
            Take Photo
          </Button>
        </Box>
      </Modal>

      <Box width="100%" maxWidth="1200px">
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" mb={2}>
          <Button
            variant="contained"
            onClick={handleOpen}
            sx={{ bgcolor: '#aa00ff' }}
            startIcon={<AddIcon />}
          >
            Add Item
          </Button>
          <Button
            variant="contained"
            onClick={handleCameraOpen}
            sx={{ bgcolor: '#aa00ff' }}
            startIcon={<CameraAltIcon />}
          >
            Scan Item
          </Button>
          <TextField
            id="search"
            label="Search"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: '300px' }}
          />
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
            sx={{ width: '300px' }}
          />
        </Stack>

        <Stack direction="row" flexWrap="wrap" gap={2} justifyContent="center">
          {filteredInventory.map((item) => (
            <Card key={item.name} sx={{ minWidth: 275, bgcolor: '#424242', color: '#ffffff' }}>
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
                    sx={{ bgcolor: '#aa00ff' }}
                    startIcon={<InfoIcon />}
                  >
                    View Details
                  </Button>
                  <IconButton
                    onClick={() => removeItem(item.name)}
                    sx={{ bgcolor: '#aa00ff', color: '#ffffff' }}
                    aria-label="delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Box>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

export default Home;
