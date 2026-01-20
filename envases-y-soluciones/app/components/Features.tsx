export default function Features() {
  const features = [
    {
      icon: "♻️",
      title: "Material reutilizable",
      description: "Envases eco-friendly",
    },
    {
      icon: "📦",
      title: "Venta al mayoreo",
      description: "Precios especiales",
    },
    {
      icon: "🚚",
      title: "Envíos a todo el país",
      description: "Entrega segura",
    },
  ];

  return (
    <div className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-4 justify-center">
              <span className="text-3xl">{feature.icon}</span>
              <div>
                <h3 className="font-montserrat font-semibold text-gray-800">{feature.title}</h3>
                <p className="font-montserrat text-sm text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
