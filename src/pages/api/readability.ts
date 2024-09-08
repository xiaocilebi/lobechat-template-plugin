import {NextApiRequest, NextApiResponse} from 'next';
import axios from 'axios';
import {JSDOM} from 'jsdom';
import {Readability} from '@mozilla/readability';

// 从环境变量中获取预设的 token
// const presetToken = process.env.PRESET_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // // 获取 Authorization 头部
    // const authHeader = req.headers.authorization;
    // // 检查 Authorization 头部是否存在
    // if (!authHeader) {
    //     res.status(401).json({message: 'Authorization header is required.'});
    //     return;
    // }
    // // 检查 Authorization 头部的值是否与预设的 token 匹配
    // if (authHeader !== `Bearer ${presetToken}`) {
    //     res.status(401).json({message: 'Invalid token.'});
    //     return;
    // }
    // 处理POST请求
    if (req.method === 'POST') {
        let body = req.body
        const {url} = body;
        if (!url) {
            res.status(400).json({message: 'URL is required in the request body.'});
            return;
        }
        const article = await fetchAndParseArticle(url);
        if (article) {
            const textContent = article.textContent;
            res.status(200).json({text: textContent});
        } else {
            res.status(500).json({message: 'Failed to fetch and parse the article.'});
        }
    } else {
        // 处理其他类型的请求，如GET，PUT等
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

async function fetchAndParseArticle(url: string) {
    try {
        const response = await axios.get(url, {timeout: 5000}) // Set timeout to 5000 milliseconds
        ;
        const document = new JSDOM(response.data).window.document;
        return new Readability(document).parse();
    } catch (error) {
        console.error(error);
    }
}