const fetchData = async () => {
	const response = await fetch('/find-work.json');

	const jsonData = await response.json();
	return jsonData;
};

export default fetchData;
