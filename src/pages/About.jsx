const About = () => {
  return (
    <div className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-6">About SilaiMart</h1>
          <p className="text-xl text-gray-300">Bringing Divine Art to Your Doorstep</p>
        </div>

        <div className="space-y-12">
          <div className="bg-gray-900 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-bronze mb-4">Our Story</h2>
            <p className="text-gray-300 leading-relaxed">
              SilaiMart was founded with a vision to make divine art accessible to everyone. 
              We specialize in handcrafted sculptures and spiritual artifacts that bring 
              peace and positivity to your sacred spaces.
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-bronze mb-4">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              To preserve and promote traditional craftsmanship while making spiritual 
              art accessible to modern homes and temples worldwide.
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-bronze mb-4">Quality Promise</h2>
            <p className="text-gray-300 leading-relaxed">
              Every piece in our collection is carefully selected and crafted by skilled 
              artisans using traditional techniques passed down through generations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;