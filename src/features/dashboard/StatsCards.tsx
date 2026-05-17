const StatsCards = () => {
  const stats = [
    { title: "Total Families", value: "125" },
    { title: "Total Persons", value: "300" },
    { title: "High-Vulnerability Families", value: "25" },
    { title: "Total Assistance Provided", value: "57" },
  ];

  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-2 text-sm font-medium text-gray-600">
            {stat.title}
          </h2>
          <p className="text-2xl font-semibold text-[#0066FF]">{stat.value}</p>
        </div>
      ))}
    </section>
  );
};

export default StatsCards;
