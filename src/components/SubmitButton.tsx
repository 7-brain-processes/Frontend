import { Button, ButtonProps } from '@mui/material';
import { border } from '@mui/system';

interface CustomButtonProps extends ButtonProps {
    text: string;
    disabled?: boolean;
    width?: number | string;
    height?: number | string;
    colorScheme?: 'primary' | 'secondary';
}

const SubmitButton: React.FC<CustomButtonProps> = ({
    text,
    disabled = false,
    width = '100%',
    height = '56px',
    colorScheme = 'primary',
    ...props
}) => {
    const styles = {
        borderRadius: '16px',
        border: colorScheme === 'primary' ? 'none' : '1px solid #CED2DA',
        boxShadow: 'none',
        width,
        height,
        fontSize: '16px',
        textTransform: 'none',
        bgcolor: colorScheme === 'primary' ? '#2076e0' : '#FFFFFF',
        color: colorScheme === 'primary' ? '#FFFFFF' : '#344051',
        '&:hover': {
            bgcolor: colorScheme === 'primary' ? '#2076e0' : '#FFFFFF',
        },
        '&.Mui-disabled': {
            bgcolor: colorScheme === 'primary' ? '#2076e0' : '#FFFFFF',
            color: colorScheme === 'primary' ? '#FFFFFF' : '#344051',
            opacity: 0.6,
            cursor: 'not-allowed',
        },
        '&.Mui-disabled:hover': {
            bgcolor: colorScheme === 'primary' ? '#2076e0' : '#FFFFFF',
        },
    };

    return (
        <Button
            type="submit"
            variant="contained"
            disabled={disabled}
            sx={styles}
            {...props}
        >
            {text}
        </Button>
    );
};

export default SubmitButton;