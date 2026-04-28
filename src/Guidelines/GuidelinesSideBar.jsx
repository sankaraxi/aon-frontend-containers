import React from 'react';
import { RxHamburgerMenu } from "react-icons/rx";

const GuidelinesSideBar = () => {
  const steps = [
    {
      step: '01',
      title: 'Open Terminal',
      details: [
        <p className='m-0'>Open terminal using shortcut Ctrl + `</p>,
        <p className='m-0'> 
        Select <span className='bg-yellow-100 px-1 rounded font-mono text-red-600'><RxHamburgerMenu className="inline-block mx-1 text-red-500" /> →  Terminal → New Terminal</span>  from the left top corner
      </p>,
      ],
      image: '/guidelines_image1.png', // Replace with actual image paths
    },
    {
      step: '02',
      title: 'Install Dependencies',
      details: [<p className='m-0'>Run <span className='bg-yellow-100 px-1 rounded font-mono text-red-600'>npm install</span> to install the necessary dependencies</p>],
      image: '/guidelines_image2.png',
    },
    {
      step: '03',
      title: 'Launch Project',
      details: [<p className='m-0'>Run <span className='bg-yellow-100 px-1 rounded font-mono text-red-600'>npm run dev</span> to start the development server</p>],
      image: '/guidelines_image3.png',
    },
    {
      step: '04',
      title: 'View Your Output',
      details: [<p className='m-0'>Click on the <span className='bg-yellow-100 px-1 rounded font-mono text-red-600'>Output</span> button in the bottom right corner to navigate to your output page</p>],
      image: '/guidelines_image6.png',
    },
    {
      step: '05',
      title: 'Add Your Code',
      details: [<p className='m-0'>Navigate to the <span className='bg-yellow-100 px-1 rounded font-mono text-red-600'>App.css</span> file to add your styles</p>,<p className='m-0'>Navigate to the <span className='bg-yellow-100 px-1 rounded font-mono text-red-600'>App.jsx</span> file to add your code</p>],
      image: '/guidelines_image4.png',
    },
    {
      step:'06',
      title: 'To Run and Test Your Code',
      details: [<p className='m-0'>Run and Test your code by clicking <span className='bg-yellow-100 px-1 rounded font-mono text-red-600'>Run Test</span> button once you have written your code</p>],
      image: '/guidelines_image7.png',

    },
    {
      step: '07',
      title: 'Submit Assignment',
      details: [<p className='m-0'>Submit the assignment by clicking <span className='bg-yellow-100 px-1 rounded font-mono text-red-600'>Submit Assignment</span> button once you finished coding</p>],
      image: '/guidelines_image5.png',
    }, 
    
  ];

  return (
    <div className="max-w-5xl  pt-4 bg-white shadow-md rounded-lg">

      <header className="mb-4 pl-6 border-b border-gray-200 flex flex-col justify-between">
        <div className="ml-3">
          <h2 className="!text-2xl !font-bold text-gray-800 text-left">Project Setup Guidelines</h2>
          <p className= "text-gray-500 mt-1">Follow these steps to set up your development environment</p>
        </div>

        <div className=" ml-3  rounded-r-md">
          <p className="text-black-800 !font-bold text-lg flex items-center gap-2">
            Important Note
          </p>
          <p className="text-black-700 !text-[15px] mt-1">
            All commands such as <code className="bg-yellow-100 px-1 rounded font-mono text-red-600">npm install</code> and <code className="bg-yellow-100 px-1 rounded font-mono text-red-600">npm run dev</code> must be executed <strong>within the assessment environment</strong> (the browser-based VS Code terminal), <strong>not on your local machine</strong>.
          </p>
        </div>
      </header>
      <ol className="space-y-10">
        {steps.map(({ step, title, details, image }, index) => (
          <li key={index} className="flex gap-6">
            <div className="flex md:flex-col">
              <div className="mr-4 md:mr-0 md:mb-4">
                <div className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-full text-sm font-medium text-gray-600">
                  {step}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block w-px h-full bg-gray-200 ml-4"></div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="flex-1">
                <h3 className="!text-[22px] !font-bold text-gray-800 mb-2">{title}</h3>
                <ul className="space-y-1 text-gray-800 !text-[17px]">
                  {details.map((item, i) => (
                    <li key={i} className="flex items-baseline">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mr-2.5 flex-shrink-0 mt-1.5"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-3/4 mt-3 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                <img 
                  src={image} 
                  alt={`Step ${step}: ${title}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/192x128?text=Step+' + step;
                  }}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default GuidelinesSideBar;