import axios from 'axios';

export default function useNotice() {
    const noticeUrl = 'https://unirun-notice.ohnnn.com/'

    const fetchNotice = async () => {
        try {
            const response = await axios.get(noticeUrl);
            const title = response.data.title;
            const message = response.data.message;
            const type = response.data.type;
            return {
                title,
                message,
                type
            }
        } catch (error) {
            console.error(error);
            return {
                title: '错误',
                message: '获取通知时出现错误',
                type: 'error',
            };
        }
    }
    return {
        fetchNotice
    }
}