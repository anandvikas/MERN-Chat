import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';


import { useState } from 'react';

export const SwitchInput = (props) => {
    let {
        label,
        isChecked,
        register,
        name
    } = props
    return (
        <FormControlLabel control={<Switch {...register(name)} defaultChecked={isChecked} />} label={label} />
    );
}

export const PasswordInput = (props) => {
    let {
        variant,
        label,
        name,
        error,
        register,
        registerFields
    } = props

    variant = variant ?? "filled";

    let styles = {}
    if (variant === "filled") {
        styles.Component = FilledInput
    } else if (variant === "outlined") {
        styles.Component = OutlinedInput
    } else if (variant === "standard") {
        styles.Component = Input
    }

    const [visibility, setVisibility] = useState(false)
    return (
        <FormControl
            error={error ? true : false}
            variant={variant}
            fullWidth
        >
            <InputLabel>{label}</InputLabel>
            <styles.Component
                type={visibility ? 'text' : 'password'}
                {...register(name, registerFields)}
                endAdornment={
                    <InputAdornment position="end" onClick={() => { setVisibility(!visibility) }}>
                        {visibility ? <VisibilityOff sx={{ cursor: "pointer" }} /> : <Visibility sx={{ cursor: "pointer" }} />}
                    </InputAdornment>
                }
            />
            <FormHelperText id="component-error-text">{error ? error.message : " "}</FormHelperText>
        </FormControl>
    )
}


export const CommonInput = (props) => {
    let {
        variant,
        type,
        label,
        name,
        error,
        register,
        registerFields,
        adornment
    } = props

    variant = variant ?? "filled";

    let styles = {}
    if (variant === "filled") {
        styles.Component = FilledInput
    } else if (variant === "outlined") {
        styles.Component = OutlinedInput
    } else if (variant === "standard") {
        styles.Component = Input
    }

    type = type ?? "text"

    return (
        <FormControl
            error={error ? true : false}
            variant={variant}
            fullWidth
        >
            <InputLabel>{label}</InputLabel>
            <styles.Component
                type={type}
                {...register(name, registerFields)}
                endAdornment={adornment?.end && <InputAdornment position="end" >{adornment.end}</InputAdornment>}
                startAdornment={adornment?.start && <InputAdornment position="start">{adornment.start}</InputAdornment>}
            />
            <FormHelperText id="component-error-text">{error ? error.message : " "}</FormHelperText>
        </FormControl>
    )
}

export const CheckboxInput = (props) => {
    let { name, label, checked, register, registerFields } = props
    return (
        <FormControlLabel control={<Checkbox defaultChecked={checked} {...register(name, registerFields)} />} label={label} />
    )
}

export const AreaInput = (props) => {
    let {
        variant,
        type,
        label,
        name,
        error,
        register,
        registerFields,
        adornment
    } = props

    variant = variant ?? "filled";

    let styles = {}
    if (variant === "filled") {
        styles.Component = FilledInput
    } else if (variant === "outlined") {
        styles.Component = OutlinedInput
    } else if (variant === "standard") {
        styles.Component = Input
    }

    type = type ?? "text"

    return (
        <FormControl
            error={error ? true : false}
            variant={variant}
            fullWidth
        >
            <InputLabel>{label}</InputLabel>
            <styles.Component
                type={type}
                multiline
                rows={10}
                {...register(name, registerFields)}
                endAdornment={adornment?.end && <InputAdornment position="end" >{adornment.end}</InputAdornment>}
                startAdornment={adornment?.start && <InputAdornment position="start">{adornment.start}</InputAdornment>}
            />
            <FormHelperText id="component-error-text">{error ? error.message : " "}</FormHelperText>
        </FormControl>
    )
}

export const FileInput = (props) => {

    let {
        variant,
        label,
        name,
        error,
        register,
        registerFields,                
    } = props

    return (
        <FormControl
            error={error ? true : false}
            variant={variant}
            fullWidth
        >
            <IconButton color="primary" component="label">
                <input
                    type="file" accept="image/*" {...register(name, registerFields)}                    
                    hidden
                />
                <AttachFileIcon fontSize="medium" /> {label}
            </IconButton>
            <FormHelperText id="component-error-text">{error ? error.message : " "}</FormHelperText>
        </FormControl>
    )
}

export const SelectInput = (props) => {
    let {
        variant,
        type,
        label,
        name,
        error,
        register,
        registerFields,   
        options     
    } = props

    variant = variant ?? "filled";
    options = options ?? []

    let styles = {}
    if (variant === "filled") {
        styles.Component = FilledInput
    } else if (variant === "outlined") {
        styles.Component = OutlinedInput
    } else if (variant === "standard") {
        styles.Component = Input
    }

    type = type ?? "text"

    return (
        <FormControl
            error={error ? true : false}
            variant={variant}
            fullWidth
        >
            <InputLabel id="demo-simple-select-helper-label">{label}</InputLabel>
            <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                defaultValue=""
                {...register(name, registerFields)}
                label={label}

            >
                <MenuItem value=""><em>Select</em></MenuItem>
                {
                    options.map((ele, ind)=><MenuItem key={ind} value={ele.value}>{ele.text}</MenuItem>)
                }
                {/* <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem> */}
            </Select>
            <FormHelperText id="component-error-text">{error ? error.message : " "}</FormHelperText>
        </FormControl>
    )
}