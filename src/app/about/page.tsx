export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">About Packlite</h1>
        
        <div className="prose dark:prose-invert">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Packlite helps hikers and trekkers efficiently pack for their outdoor adventures, 
            focusing on weight optimization, gear organization, and sharing capabilities.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">Our Mission</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Our mission is to help outdoor enthusiasts pack smarter and lighter, so they can enjoy 
            their adventures without the burden of unnecessary weight. We believe that with the right 
            tools and information, anyone can optimize their pack and enhance their outdoor experience.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">Key Features</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Gear Management:</strong> Catalog your gear with weights, categories, and photos.</li>
            <li><strong>Trip Packing Lists:</strong> Create and manage multiple lists for different adventures.</li>
            <li><strong>Weight Optimization:</strong> Get insights on how to reduce your pack weight.</li>
            <li><strong>Social Sharing:</strong> Learn from and share with the community of hikers.</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">Why Pack Light?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Carrying less weight means more comfort, less fatigue, and often a more enjoyable experience 
            on the trail. By carefully analyzing what you really need and optimizing your gear choices, 
            you can significantly reduce your pack weight without sacrificing safety or comfort.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">Our Team</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Packlite was created by a team of avid hikers and software developers who 
            wanted to solve the common challenge of overpacking. We&apos;ve combined our passion 
            for outdoor adventures with modern web technologies to create a tool that 
            we hope will help fellow outdoor enthusiasts.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">Get Started</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Ready to pack smarter? Create an account, add your gear, and start planning your next adventure 
            with Packlite. Join our community of weight-conscious hikers and discover how 
            much lighter your pack can be.
          </p>
        </div>
      </div>
    </div>
  );
}