import {
    CHANGE_LANGUAGE
} from '../model/vo/actionTypes';
import cFetch from '../lib/utils/cFetch';
import { API_CONFIG } from '../data/api.js';


export default function changeLanguage(lan){
    return{
        type:CHANGE_LANGUAGE,
        language:lan
    }
}