import { BASE_URL } from "./Auth/appwriteauth";

export const beautifulFonts = [
  // 1. Gorgeous high-contrast serif
  { 
    id: 'playfair-display', 
    name: 'Playfair Display (Elegant Headings)', 
    style: 'serif',
    bestFor: 'Wedding sites, luxury brands, headings',
    example: "The quick brown fox jumps over the lazy dog"
  },

  // 2. Sophisticated literary font
  { 
    id: 'cormorant', 
    name: 'Cormorant (Poetic Beauty)', 
    style: 'serif',
    bestFor: 'Book covers, stationery, art galleries',
    example: "Typography is the craft of endowing human language with durable visual form"
  },

  // 3. Romantic script
  { 
    id: 'dancing-script', 
    name: 'Dancing Script (Handwritten Charm)', 
    style: 'script',
    bestFor: 'Invitations, love letters, personal blogs',
    example: "Every moment with you feels like a beautiful dance"
  },

  // 4. Delicate calligraphy
  { 
    id: 'tangerine', 
    name: 'Tangerine (Artistic Flourish)', 
    style: 'script',
    bestFor: 'Poetry, wine labels, creative portfolios',
    example: "She walked in beauty, like the night"
  },

  // 5. Expressive brush font
  { 
    id: 'alex-brush', 
    name: 'Alex Brush (Signature Style)', 
    style: 'handwriting',
    bestFor: 'Logos, signatures, artistic headings',
    example: "Creativity takes courage"
  }
];

export const fonts = {
  serif: [
    "Roboto",
    "Lora",
    "Roboto Slab",
    "Playfair Display",
    "Libre Baskerville",
    "Noto Serif",
    "PT Serif",
    "EB Garamond",
    "Crimson Text",
    "Slabo 27px",
    "Neuton",
    "Zilla Slab",
    "Josefin Slab",
    "Unna",
    "Abhaya Libre",
    "Open Sans",
    "Montserrat",
    "Poppins",
    "Lato",
    "Ubuntu",
    "Rubik",
    "Cabin",
    "Heebo",
    "Notable",
    "Barlow",
    "Archivo Narrow",
    "Asap",
    "Ropa Sans",
    "Nunito",
    "Quicksand",
    "Titillium Web",
    "Mulish" ,
    "Squada One",
    "Bahianiata",
    "Barriecito",
    "Mountains of Christmas",
    "Lobster",
    "Abril Fatface",
    "Righteous",
    "Comfortaa",
    "Geostar",
    "Patua One",
    "Oswald",
    "Arvo",
    "Concert One",
    "Indie Flower",
    "Pacifico",
    "Shadows Into Light",
    "Bonbon",
    "Amatic SC",
    "Great Vibes",
    "Architects Daughter",
    "Nothing You Could Do",
    "Reenie Beanie",
    "Sue Ellen Francisco",
    "Dancing Script",
    "Caveat",
    "Satisfy",
    "Sacramento",
    "Beth Ellen",
    "Nanum Pen Script",
    "Cedarville Cursive",
    "Vibur",
    "Gamja Flower",
    "Miniver",
    "Roboto Mono",
    "Inconsolata",
    "Source Code Pro",
    "Cousine",
    "PT Mono",
    "Nanum Gothic Coding",
    "Space Mono",
    "Anonymous Pro",
    "Cutive Mono",
    "Oxygen Mono"
  ]
};

export const sections = [
  {
    id: 'free-plan',
    title: 'Free Plan Details',
    content: [
      {
        heading: 'Storage Limits',
        paragraph: 'With the free plan, each user gets:',
        listItems: [
          '50MB total storage per user',
          'Maximum 5MB per file upload',
          'Up to 100 files per user'
        ]
      },
      {
        heading: 'Upgrade Options',
        paragraph: 'Need more space? Upgrade your account for additional storage and features:',
        link: { 
          text: 'View Pricing & Upgrade', 
          url: '/pricing' 
        }
      }
    ]
  },
  {
    id: 'file-types',
    title: 'Supported File Types',
    content: [
      {
        heading: 'Allowed File Formats',
        paragraph: 'You can upload these file types:',
        listItems: [
          'Documents: PDF, DOCX, PPTX, XLSX, TXT (max 5MB)',
          'Images: JPG, PNG, GIF, SVG (max 5MB)',
          'Archives: ZIP, RAR (max 5MB)',
          'Audio: MP3 (max 5MB)',
          'Video: MP4 (max 5MB)'
        ]
      },
      {
        heading: 'Restricted Files',
        paragraph: 'For security reasons, these file types are blocked:',
        listItems: [
          'Executables (.exe, .bat, .sh)',
          'Script files (.js, .php)',
          'Dangerous extensions (.iso, .dmg)'
        ]
      }
    ]
  },
  {
    id: 'permissions',
    title: 'File Permissions & Access Control',
    content: [
      {
        heading: 'Permission Levels',
        paragraph: 'Control who can access your files:',
        listItems: [
          'Private (only you)',
          'Team Access (specific members)',
          'Public (anyone with link)'
        ]
      },
      {
        heading: 'How to Set Permissions',
        paragraph: 'When uploading or editing a file:',
        listItems: [
          '1. Select the file in your dashboard',
          '2. Click "Share" button',
          '3. Choose access level (Private/Team/Public)',
          '4. For teams, select specific members',
          '5. Save changes'
        ]
      }
    ]
  },
  {
    id: 'file-management',
    title: 'Managing Your Files',
    content: [
      {
        heading: 'Uploading Files',
        paragraph: 'To add files to your storage:',
        listItems: [
          'Drag and drop files into your dashboard',
          'Or click "Upload" and select files',
          'Files automatically check for type/size limits'
        ]
      },
      {
        heading: 'Organizing Files',
        paragraph: 'Keep your storage tidy:',
        listItems: [
          'Create folders to group related files',
          'Use tags to categorize documents',
          'Search by filename or content type'
        ]
      },
      {
        heading: 'Deleting Files',
        paragraph: 'Important notes about deletion:',
        listItems: [
          'Deleted files count against your quota for 30 days',
          'After 30 days, files are permanently removed',
          'Empty your trash to immediately free up space'
        ]
      }
    ]
  },
  {
    id: 'version-history',
    title: 'Version History & Recovery',
    content: [
      {
        heading: 'How Versioning Works',
        paragraph: 'D-ocStore automatically:',
        listItems: [
          'Keeps 30 days of file history',
          'Tracks all changes to documents',
          'Stores previous versions without extra space usage'
        ]
      },
      {
        heading: 'Restoring Old Versions',
        paragraph: 'To recover a previous version:',
        listItems: [
          '1. Right-click the file and select "Version History"',
          '2. Preview different versions',
          '3. Click "Restore" on the version you want',
          '4. Confirm to replace current version'
        ]
      }
    ]
  }
];
export  const footerData = {
    title: 'Quick Links',
    links: [
      { text: 'Home', url: BASE_URL },
      // { text: 'Blog', url: '#' },
      { text: 'Support', url: `${BASE_URL}/support` },
      { text: 'Contact Us', url: `${BASE_URL}/contact` }
    ],
    advertisement: {
      title: 'Try Our Pro Version',
      text: 'Upgrade to unlock all features and premium support.',
      link: {
        text: 'Learn More',
        url: '#'
      }
    },
    copyright: '© 2023 My Awesome Product. All rights reserved.'
  };