import React from 'react';
import { CommentDto } from "../../../types";

interface PublicCommentsItemProps {
    publicComment: CommentDto;
}

const PublicCommentsItem: React.FC<PublicCommentsItemProps> = ({ publicComment }) => {

    const formatDate = (date: (Date)) => {
        if (!date) return "Нет данных";
        return new Date(date).toLocaleDateString("ru-RU");
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #CED2DA', paddingBottom: '16px', paddingLeft: '8px', paddingRight: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                <span style={{ color: '#2076e0', fontSize: '14px' }}>{publicComment.author.displayName}</span>
                <span style={{ fontSize: '14px' }}>-</span>
                <span style={{ fontSize: '14px' }}>{formatDate(publicComment.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{publicComment.text}</span>
            </div>
        </div>
    );
};

export default PublicCommentsItem;