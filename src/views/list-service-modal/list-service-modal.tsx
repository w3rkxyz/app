import PostListModal from '@/components/reusable/PostListModal/PostListModal';

type Props = {
	closeModal: () => void;
};

const ListServiceModal = ({ closeModal }: Props) => {
	return (
		<>
			<PostListModal closeModal={closeModal} />
		</>
	);
};

export default ListServiceModal;
