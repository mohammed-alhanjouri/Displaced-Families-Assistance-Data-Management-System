// Card containing family identification details for the registration process

const FamilyIdentificationCard = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Family Identification</h2>
      <form>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="nationalID"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              National ID *
            </label>
            <input
              type="text"
              id="nationalID"
              name="nationalID"
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="familyHeadName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Family Head Name *
            </label>
            <input
              type="text"
              id="familyHeadName"
              name="familyHeadName"
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number *
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default FamilyIdentificationCard;
