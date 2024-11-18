import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyChL4PXmR5RHmNnlVc6PiocbEsq3ygpD3E",
  authDomain: "bharatfreelance-hub-538c2.firebaseapp.com",
  projectId: "bharatfreelance-hub-538c2",
  storageBucket: "bharatfreelance-hub-538c2.appspot.com",
  messagingSenderId: "297970426246",
  appId: "1:297970426246:web:fc266f818611f1c14a8c07"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Function to fetch and display client details
async function fetchClientDetails(clientId) {
  try {
    console.log(`Fetching details for client with ID: ${clientId}`);
    
    const clientRef = doc(db, "users", clientId);
    const clientSnap = await getDoc(clientRef);

    if (!clientSnap.exists()) {
      console.error(`No such client found with ID: ${clientId}`);
      return;
    }

    const clientData = clientSnap.data();
    console.log('Client data:', clientData);

    // Update the client card in the sidebar
    renderClientCard(clientData);
  } catch (error) {
    console.error("Error fetching client details: ", error);
  }
}

// Function to dynamically render the client card in the sidebar
function renderClientCard(client) {
  const container = document.getElementById('client-card-container');

  const card = document.createElement('div');
  card.className = 'card mb-4';

  const cardHeader = document.createElement('div');
  cardHeader.className = 'card-header text-center text-white';
  cardHeader.style.backgroundColor = '#ff5722';
  cardHeader.textContent = 'Client Details';

  const cardBody = document.createElement('div');
  cardBody.className = 'card-body text-center';

  const clientImage = document.createElement('img');
  clientImage.className = 'img-fluid rounded-circle mb-3';
  clientImage.style.width = '120px';
  clientImage.style.height = '120px';
  clientImage.src = client.profileImageUrl || '../img/client.png'; // Default image if none provided
  clientImage.alt = client.name || 'Client Photo';

  const clientName = document.createElement('h5');
  clientName.className = 'card-title';
  clientName.textContent = client.name || 'Client Name';

  const clientLocation = document.createElement('p');
  clientLocation.className = 'card-text';
  clientLocation.textContent = `Based in: ${client.basedOn || 'City, Country'}`;

  const clientAbout = document.createElement('p');
  clientAbout.className = 'card-text';
  clientAbout.textContent = `About: ${client.aboutUs || 'A brief description about the client and their professional background.'}`;

  const clientEmail = document.createElement('p');
  clientEmail.className = 'card-text';
  clientEmail.innerHTML = `<strong>Email:</strong> ${client.email || 'client@example.com'}`;

  const socialLinksDiv = document.createElement('div');
  socialLinksDiv.className = 'social-links';

  const linkedinLink = document.createElement('a');
  linkedinLink.href = client.linkedin || '#';
  linkedinLink.target = '_blank';
  linkedinLink.className = 'btn btn-sm me-2';
  linkedinLink.style.borderColor = '#ff5722';
  linkedinLink.textContent = 'LinkedIn';
  linkedinLink.style.display = client.linkedin ? 'inline-block' : 'none';

  const twitterLink = document.createElement('a');
  twitterLink.href = client.twitter || '#';
  twitterLink.target = '_blank';
  twitterLink.className = 'btn btn-sm';
  twitterLink.style.borderColor = '#ff5722';
  twitterLink.textContent = 'Twitter';
  twitterLink.style.display = client.twitter ? 'inline-block' : 'none';

  socialLinksDiv.appendChild(linkedinLink);
  socialLinksDiv.appendChild(twitterLink);

  cardBody.appendChild(clientImage);
  cardBody.appendChild(clientName);
  cardBody.appendChild(clientLocation);
  cardBody.appendChild(clientAbout);
  cardBody.appendChild(clientEmail);
  cardBody.appendChild(socialLinksDiv);

  card.appendChild(cardHeader);
  card.appendChild(cardBody);

  container.appendChild(card);
}

// Function to fetch and display freelancers who applied for a specific job
async function fetchFreelancersApplied(jobId) {
  try {
    console.log(`Attempting to fetch job with ID: ${jobId}`);

    const jobRef = doc(db, "jobs", jobId);
    const jobSnap = await getDoc(jobRef);

    if (!jobSnap.exists()) {
      console.error(`No such job found with ID: ${jobId}`);
      return;
    }
    console.log(`Job found: ${jobSnap.id}`);

    const clientId = jobSnap.data().postedBy; 
    if (clientId) {
      fetchClientDetails(clientId);
    } else {
      console.error("Client ID not found in job document");
    }

    const applicationsRef = collection(db, "jobs", jobId, "applications");
    const applicationsSnap = await getDocs(applicationsRef);
    
    const freelancerContainer = document.getElementById('freelancers-container');
    freelancerContainer.innerHTML = ''; // Clear existing freelancers

    if (applicationsSnap.empty) {
      console.log('No applications found for this job.');
      freelancerContainer.innerHTML = '<p>No freelancers have applied for this job yet.</p>';
      return;
    }

    console.log(`Found ${applicationsSnap.size} applications for this job.`);

    for (const application of applicationsSnap.docs) {
      const freelancerId = application.id;
      console.log(`Attempting to fetch freelancer with ID: ${freelancerId}`);

      const freelancerRef = doc(db, "freelancer", freelancerId);
      const freelancerSnap = await getDoc(freelancerRef);

      if (freelancerSnap.exists()) {
        const freelancerData = freelancerSnap.data();
        console.log(`Freelancer data found for ID: ${freelancerId}`, freelancerData);
        renderFreelancerCard(freelancerData, freelancerId, jobId);
      } else {
        console.warn(`No freelancer found for ID: ${freelancerId}`);
        const missingFreelancerDiv = document.createElement('div');
        missingFreelancerDiv.className = 'alert alert-warning';
        missingFreelancerDiv.textContent = `Freelancer data missing for ID: ${freelancerId}`;
        freelancerContainer.appendChild(missingFreelancerDiv);
      }
    }
  } catch (error) {
    console.error("Error fetching applied freelancers: ", error);
  }
}

// Function to dynamically render a freelancer card
function renderFreelancerCard(freelancerData, freelancerId, jobId) {
  const freelancerContainer = document.getElementById('freelancers-container');

  // Create the card element
  const card = document.createElement('div');
  card.className = 'card mb-4';

  // Card body
  const cardBody = document.createElement('div');
  cardBody.className = 'card-body text-center';

  // Freelancer image
  const freelancerImage = document.createElement('img');
  freelancerImage.className = 'img-fluid rounded-circle mb-3';
  freelancerImage.style.width = '100px';
  freelancerImage.style.height = '100px';
  freelancerImage.src = freelancerData.profileImageUrl || '../img/freelancer.png'; // Default image if none provided
  freelancerImage.alt = freelancerData.name || 'Freelancer Photo';

  // Freelancer name
  const freelancerName = document.createElement('h5');
  freelancerName.className = 'card-title';
  freelancerName.textContent = freelancerData.firstName || 'Freelancer Name';

  // Freelancer skills
  const freelancerSkills = document.createElement('p');
  freelancerSkills.className = 'card-text';
  freelancerSkills.textContent = `Skills: ${freelancerData.skills || 'Skills not provided'}`;

//   // Freelancer bio
//   const freelancerBio = document.createElement('p');
//   freelancerBio.className = 'card-text';
//   freelancerBio.textContent = `Bio: ${freelancerData.bio || 'Bio not provided'}`;

  // Freelancer email
  const freelancerEmail = document.createElement('p');
  freelancerEmail.className = 'card-text';
  freelancerEmail.innerHTML = `<strong>Email:</strong> ${freelancerData.email || 'freelancer@example.com'}`;

  // Append elements to the card body
//   cardBody.appendChild(freelancerImage);
  cardBody.appendChild(freelancerName);
  cardBody.appendChild(freelancerSkills);
//   cardBody.appendChild(freelancerBio);
  cardBody.appendChild(freelancerEmail);

  // Append card body to card
  card.appendChild(cardBody);

  // Append the card to the freelancer container
  freelancerContainer.appendChild(card);
}


// Fetch job details and freelancers on page load
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id'); // Fetch job ID from URL

  if (jobId) {
    fetchFreelancersApplied(jobId);
  } else {
    console.error("Job ID not found in URL");
  }
});
