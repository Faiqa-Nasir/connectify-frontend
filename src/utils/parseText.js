import React from 'react';
import { Text } from 'react-native';

/**
 * Parse a string and return components with special formatting for hashtags and mentions
 * 
 * @param {string} text - The text to parse
 * @param {object} options - Options object with text styles and callbacks
 * @returns {array} Array of Text components
 */
const parseText = (text, options = {}) => {
    const {
        baseStyle = {},
        specialStyle = {},
        onHashtagPress = () => {},
        onMentionPress = () => {},
    } = options;

    if (!text) return null;
    
    // Regex to match hashtags and mentions
    const regex = /([@#][\w]+)/g;
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
        if (part.startsWith('#')) {
            return (
                <Text 
                    key={`hashtag-${index}`}
                    style={specialStyle}
                    onPress={() => onHashtagPress(part.substring(1))}
                >
                    {part}
                </Text>
            );
        } else if (part.startsWith('@')) {
            return (
                <Text 
                    key={`mention-${index}`} 
                    style={specialStyle}
                    onPress={() => onMentionPress(part.substring(1))}
                >
                    {part}
                </Text>
            );
        } else {
            return <Text key={`text-${index}`} style={baseStyle}>{part}</Text>;
        }
    });
};

export default parseText;
