import { SparklesIcon, ShieldCheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const sections = [
  {
    icon: SparklesIcon,
    title: 'Our Story',
    content: 'SilaiMart was founded with a vision to make divine art accessible to everyone. We specialize in handcrafted sculptures and spiritual artifacts that bring peace and positivity to your sacred spaces.',
  },
  {
    icon: GlobeAltIcon,
    title: 'Our Mission',
    content: 'To preserve and promote traditional craftsmanship while making spiritual art accessible to modern homes and temples worldwide.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Quality Promise',
    content: 'Every piece in our collection is carefully selected and crafted by skilled artisans using traditional techniques passed down through generations.',
  },
];

const stats = [
  { value: '500+', label: 'Sculptures' },
  { value: '10K+', label: 'Customers' },
  { value: '50+', label: 'Artisans' },
  { value: '4.9★', label: 'Rating' },
];

const About = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-amber-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <SparklesIcon className="h-4 w-4" />
            Our Story
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About SilaiMart</h1>
          <p className="text-xl text-violet-200">Bringing Divine Art to Your Doorstep</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-bold text-primary-600">{value}</div>
                <div className="text-gray-500 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-6">
          {sections.map(({ icon: Icon, title, content }) => (
            <div key={title} className="bg-white rounded-2xl p-8 shadow-card border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-violet-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon className="h-6 w-6 text-violet-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              </div>
              <p className="text-gray-600 leading-relaxed pl-16">{content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;