export default function HowItWorks() {
  const steps = [
    {
      icon: '📸',
      title: 'Take a Photo',
      description: 'Snap a picture of any item you want to recycle',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: '🤖',
      title: 'AI Analysis',
      description: 'Our AI identifies the item and checks local recycling rules',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: '✅',
      title: 'Get Instructions',
      description: 'Receive clear guidance on how to properly dispose of the item',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: '🌍',
      title: 'Save the Planet',
      description: 'Help reduce contamination and increase recycling rates',
      color: 'bg-primary-100 text-primary-600',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Identifying recyclables has never been easier. Just four simple steps to help keep Terre Haute green.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Connection line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gray-300 z-0" />
              )}

              <div className="relative bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2 z-10">
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${step.color} mb-4`}>
                  <span className="text-3xl">{step.icon}</span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}