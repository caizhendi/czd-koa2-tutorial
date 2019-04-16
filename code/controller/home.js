import { makeRequest, mulRequest ,deepClone} from '../service/index'
import puppeteer  from 'puppeteer';
module.exports = {
    getIedInfo: async(ctx, next) => {
        let params = ctx.request.body
        let {token,id,type} = params
        let requests = [];
        let AllchildLine = [];
        let IedInfo = await makeRequest(`/ied/getIedInfo/${token}/${id}`);
        let allIedId, boolOverTemp;
        if (type === 'all') {
            if (IedInfo.code === 1) {
                allIedId = IedInfo.data.map((item) => {
                    return item.id
                })
            } else {
                await ctx.send(IedInfo)
            }

        } else {
            allIedId = [params.ied]
        }
        for (const item of allIedId) {
            let data = await makeRequest(`/ied/getIedAnaInfo/${token}/${id}/${item}`);
            AllchildLine.push(data);
            let varIds = data.data.map((item) => {
                return item.id;
            })
            varIds = encodeURIComponent(varIds.join(","))
            requests.push(makeRequest(`/query/getRealAna/${token}/${id}/${varIds}`))
        }
        let result = await mulRequest(requests);
        let _result = [];
        result.map((item, index) => {
            if (item === undefined) {
                item = [];
            } else {
                item = item.data;
            }
            let _item = [];
            for (let key in item) {
                _item.push(item[key])
            }
            _result.push(_item)
        })
        AllchildLine.map((item, index) => {
            item.data.map((_item, _index) => {
                _item.date = item.date;
                _item.num = _result[index][_index];
                _item.unit = _item.unit === "" ? "°" : _item.unit;
                _item.tempState = _item.num >= _item.hhighvalue ? "overTemp" : "normal"
            })
        })
        if (type === "all") {
            IedInfo.data.map((item, index) => {
                item.select = false;
                item.childLine = AllchildLine[index].data;
                boolOverTemp = item.childLine.some(_item => {
                    return _item.tempState !== 'normal'
                })
                if (boolOverTemp) {
                    item.tempState = 'overTemp'
                } else {
                    item.tempState = 'normal'
                }
            })
            await ctx.send(IedInfo)
        } else {
            let index = params.index;
            AllchildLine = AllchildLine[0];
            let data = deepClone(AllchildLine);
            data.data = deepClone(IedInfo.data[index]);
            data.data.childLine = deepClone(AllchildLine.data);
            boolOverTemp = data.data.childLine.some(_item => {
                return _item.tempState !== 'normal'
            })
            if (boolOverTemp) {
                data.data.tempState = 'overTemp'
            } else {
                data.data.tempState = 'normal'
            }
            data.data.select = true;
            await ctx.send(data)
        }
    },
    uploadScreenshot:async(ctx,next)=>{
        let params = ctx.request.body
        let { maintainId, formId } = params
        const browser = await puppeteer.launch({
            executablePath: './chrome-win/chrome.exe',
            // headless:false
        });
        const page = await browser.newPage();
        await page.goto('http://139.159.237.90:9090/login.jsp');
        await page.click("#btn");
        await page.waitForNavigation({
            waitUntil: 'load'
        });
        await page.goto(`http://139.159.237.90:9090/send/toShowExcel?maintainId=${maintainId}&formId=${formId}`,{waitUntil:'networkidle0'});
        const result = await page.evaluate(() => {
            let table = document.querySelector('table');
            let pic = {};
            pic.top = table.offsetTop;
            pic.left = table.offsetLeft;
            pic.width = table.offsetWidth;
            pic.height = table.offsetHeight;
            pic.name = document.querySelector(".x124").textContent + document.querySelector(".x147").textContent;
            return pic
        });
        await page.screenshot({
            path:`formJpg/${result.name}.png`,
            clip:{
                x:result.left,
                y:result.top,
                width:result.width,
                height:result.height
            }
        })
        let data = {
            code:1,
            maintainId,
            formId
        }
        await ctx.send(data)
    },
    linuxTest:async (ctx, next) => {
        await next();
        // 设置response的Content-Type:
        ctx.response.type = 'text/html';
        // 设置response的内容:
        ctx.response.body = '<h1>Hello, koa2!test</h1>';
    }
}