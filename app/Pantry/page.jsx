
'use client'

import { useState, useEffect, useRef } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, Card, IconButton, InputAdornment } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Info as InfoIcon, Search as SearchIcon, FilterList as FilterListIcon, CameraAlt as CameraAltIcon } from '@mui/icons-material';
import { Camera } from 'react-camera-pro';
import { firestore } from '@/firebase';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

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
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false); // State for camera modal
  const [viewOpen, setViewOpen] = useState(false); // State for viewing description modal
  const [viewDescription, setViewDescription] = useState(''); // State for item description
  const [viewCategory, setViewCategory] = useState(''); // State for item category
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState(''); // Add description state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [capturedImage, setCapturedImage] = useState(null); // State for captured image
  const camera = useRef(null);

  const {data: session} = useSession({
    required: true,
    onUnauthenticated() {
        redirect("/api/auth/signin?callbackUrl=/Pantry");
    },
  });

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, `inventory`));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const addItem = async (item, category, description) => {
    const docRef = doc(collection(firestore, `inventory`), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1, category, description });
    } else {
      await setDoc(docRef, { quantity: 1, category, description });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, `inventory`), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

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

      // Send image to classification API
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
        // Handle the classified data as needed
        //console.log('Classified data:', { item_name, category, description });

        // Add classified item to Firebase
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
      overflow={'auto'} // Ensure the entire content is scrollable
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
                setDescription(''); // Clear description field
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

      {/* Camera Modal */}
      <Modal
        open={cameraOpen}
        onClose={handleCameraClose}
        aria-labelledby="camera-modal-title"
        aria-describedby="camera-modal-description"
      >
        <Box sx={cameraModalStyle}>
          <Camera ref={camera} aspectRatio="cover" />
          <Button
            variant="contained"
            onClick={handleTakePhoto}
            sx={{ bgcolor: '#aa00ff', marginTop: 2 }}
          >
            Take Photo
          </Button>
        </Box>
      </Modal>

      {/* Description Modal */}
      <Modal
        open={viewOpen}
        onClose={handleViewClose}
        aria-labelledby="view-modal-title"
        aria-describedby="view-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="view-modal-title" variant="h5" component="h2" color={'#aa00ff'} sx={{ fontWeight: 'bold' }}>
            Item Description
          </Typography>
          <Typography id="view-modal-description" mt={2} color={'#ffffff'}>
            {viewDescription}
          </Typography>
          <Typography variant="h5" color={'#aa00ff'} mt={2} component="h2" sx={{ fontWeight: 'bold' }}>
            Category
          </Typography>
          <Typography id="view-modal-category" mt={2} color={'#ffffff'}>
            {viewCategory}
          </Typography>
        </Box>
      </Modal>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={2}
        mb={2}
        sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        <TextField
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputLabelProps={{
            style: { color: '#ffffff' },
          }}
          InputProps={{
            style: { color: '#ffffff' },
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{ color: '#ffffff' }} />
              </InputAdornment>
            )
          }}
          sx={{ width: { xs: '90%', sm: 'auto' } }}
        />
        <TextField
          label="Filter by Category"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          InputLabelProps={{
            style: { color: '#ffffff' },
          }}
          InputProps={{
            style: { color: '#ffffff' },
            startAdornment: (
              <InputAdornment position="start">
                <FilterListIcon style={{ color: '#ffffff' }} />
              </InputAdornment>
            )
          }}
          sx={{ width: { xs: '90%', sm: 'auto' } }}
        />
        <Button
          variant="contained"
          onClick={handleOpen}
          startIcon={<AddIcon />}
          sx={{
            bgcolor: '#aa00ff',
            width: { xs: '90%', sm: 'auto' },
          }}
        >
          Add New Item
        </Button>
        <Button
          variant="contained"
          onClick={handleCameraOpen}
          startIcon={<CameraAltIcon />}
          sx={{
            bgcolor: '#aa00ff',
            width: { xs: '90%', sm: 'auto' },
          }}
        >
          Take Photo
        </Button>
      </Box>

      <Box width={{ xs: '100%', sm: '800px' }}>
        <Box
          bgcolor={'#aa00ff'}
          color={'#ffffff'}
          py={2}
          px={3}
          borderRadius={1}
          mb={3}
        >
          <Typography variant="h4" align="center">
            Inventory Items
          </Typography>
        </Box>
        <Stack spacing={2}>
          {filteredInventory.map(({ name, quantity, category, description }) => (
            <Card
              key={name}
              variant="outlined"
              sx={{
                bgcolor: '#424242',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                flexDirection: { xs: 'row', sm: 'row' },
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="div">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="body1" color="#ffffff">
                  Quantity: {quantity}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <IconButton
                  aria-label="view info"
                  onClick={() => handleViewOpen(description, category)}
                  sx={{ color: '#aa00ff' }}
                >
                  <InfoIcon />
                </IconButton>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#aa00ff' }}
                  onClick={() => removeItem(name)}
                  startIcon={<DeleteIcon />}
                >
                  Remove
                </Button>
              </Box>
            </Card>
          ))}
        </Stack>
        
      </Box>
    </Box>
  );
}

export default Home;
