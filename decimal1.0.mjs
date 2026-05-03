class mathsup{
    static sum(init,...args){
        return args.reduce((prev,curr)=>prev+curr,init)
    }
}
class decimalMath{
    /** * @param {string} s * @param {number} d10$x* @returns {string}*/
    shiftRight(s,d10$x){
        if (d10$x===0)return s;
        if ((s.split("-").length-1)&1===1)return "-"+this.shiftRight(s.slice(1),d10$x)
        else s=s.replace(/\-/g,"")
        let [int="0",float=""]=s.split(".");
        let all=int+float;
        let ndotps=int.length+d10$x;
        let res;
        if (ndotps>=all.length){
            res=all.padEnd(ndotps,"0")
        }else{
            res=all.slice(0,ndotps)+"."+all.slice(ndotps)
        }
        return res.replace(/^(0+)(.+$)/g,"$2").replace(/^\./,"0.").replace(/\.0+$/, "").replace(/(\.\d*?[1-9])0+$/, "$1")
    }
    /** * @param {string} s * @param {number} d10$x * @returns {string} */
    shiftLeft(s,d10$x){
        if (d10$x===0)return s;
        if ((s.split("-").length-1)&1===1)return "-"+this.shiftLeft(s.slice(1),d10$x)
        else s=s.replace(/\-/g,"")
        let [int="0",float=""]=s.split(".");
        let all=int+float;
        let ndotps=int.length-d10$x;
        let res;
        let result;
        let ndotps2;
        if (ndotps<=0){
            res=all.padStart(int.length+d10$x,"0")
            ndotps2=res.length-d10$x
        }else{
            ndotps2=ndotps
            res=all
        }
        result=res.slice(0,ndotps2)+"."+res.slice(ndotps2)
        return result.replace(/^(0+)(.+$)/g,"$2").replace(/^\./,"0.").replace(/\.0+$/, "").replace(/(\.\d*?[1-9])0+$/, "$1")
    }
    #divConfig={prec:28}
    #returns=String
    #returns_isNew=false
    #mulConfig={katatubaThreshold:64}
    setprecision(value){
        if(typeof(value)!=="number")throw(new(SyntaxError("Only the Number data type can be used for precision.")));
        this.#divConfig.prec=value
        return this.#divConfig.prec
    }
    getprecision(){
        return this.#divConfig.prec
    }
    setreturns(type,isNew=false){
        if(isNew){if((type)("4294967296")){this.#returns=type;this.#returns_isNew=false;return this.#returns}}
        else{if(new(type)("4294967296")){this.#returns=type;this.#returns_isNew=true;return this.#returns}}
    }
    getreturns(){return this.#returns}
    #returnpackage(v){return this.#returns_isNew?new(this.#returns)(v):this.#returns(v)}
    add(...values){
        /**@type{string[]}val */
        const val=values.map(x=>String(x))
        const dpt=val.map(x=>x.includes(".")?x.length-x.indexOf(".")-1:0)
        const pw=Math.max(...dpt)
        const vbi=val.map(x=>BigInt(this.shiftRight(x,pw)))
        const vsm=this.shiftLeft(String(mathsup.sum(0n,...vbi)),pw)
        return this.#returnpackage(vsm)
    }
    sub(...values){
        /**@type{string[]}val *///sub(1,2,3)-->-4
        const val=values.map((v,i)=>i===0?String(v):(typeof v==="number"||typeof v==="bigint"?String(-v):(typeof v==="string"?"-"+v:null)))
        if (val.includes(null))throw new SyntaxError("Only Number, BigInt, and String arguments are accepted.")
        return this.add(...val)
    }
    mul(...values){
        const val=values.map(x=>String(x))
        const dpt=val.map(x=>x.includes(".")?x.length-x.indexOf(".")-1:0)
        const tsh=mathsup.sum(0,...dpt)//totalshift
        let args=[]
        for (let i=0;i<val.length;i++){
            args.push(this.shiftRight(val[i],dpt[i]))
        }
        const rst=String(this.#int_mul(...args))
        const dpk=this.shiftLeft(rst,tsh)
        return this.#returnpackage(dpk)
    }
    #int_mul(...values){
        /**@type{bigint[]}val *///mul(2,3,4)-->24
        const is=values.map(x=>["string","number","bigint"].includes(typeof(x)))
        if (is.includes(false))throw new SyntaxError("Only Number, BigInt, and String arguments are accepted.")
        const val=values.map(x=>BigInt(x))
        if (values.length===0)return 0n
        if (values.length===1)return this.#int_mul(values[0],1n)
        if (values.length>2)return values.reduce((prev,curr)=>this.#int_mul(prev,curr),1n)
        const n=val[0]
        const m=val[1]
        const nl=n.toString(2).length
        const ml=m.toString(2).length
        const kk=this.#mulConfig.katatubaThreshold
        if (nl<kk||ml<<kk) {
            return n*m
        }
        const shift=BigInt(Math.floor(Math.max(nl,ml)/2))
        const A=n>>shift
        const B=n%(1n<<shift)
        const C=m>>shift
        const D=m%(1n<<shift)
        const z2=this.#int_mul(A,C)
        const z0=this.#int_mul(B,D)
        const z1=this.#int_mul(A+B,C+D)
        return (z2<<(2n*shift))+((z1-z2-z0)<<shift)+z0
    }
    div(...values){
        if (values.length===0)return NaN
        if (values.length===1)values.push(1)
        const val=values.map(x=>String(x))
        const mbs=this.mul(...val.slice(1))
        const mdc=mbs.includes(".")?mbs.length-mbs.indexOf(".")-1:0
        const ndc=val[0].includes(".")?val[0].length-val[0].indexOf(".")-1:0
        const dpt=Math.max(mdc,ndc)
        const nbs=this.shiftRight(val[0],dpt)
        const mbi=BigInt(this.shiftRight(mbs,dpt))
        const nbi=BigInt(nbs)
        const res=nbi*(10n**BigInt(this.#divConfig.prec+1))/mbi
        const dpk=this.shiftLeft(String(res),this.#divConfig.prec+1+ndc-mdc)
        return this.#returnpackage(dpk)
    }
    mod(...values){
        const divResult=String(this.div(...values))
        const [intPart="0"]=divResult.split(".")
        const cleanInt=intPart==="-"?"0":intPart
        const multiplied=this.mul(...values.slice(1),cleanInt)
        const remainder=this.sub(values[0],multiplied)
        return this.#returnpackage(remainder)
    }
    pow(n,Exp=2){
        if (!Number.isInteger(Exp))throw new SyntaxError('Decimal exponentiation is not currently supported. Please use "decimal_addon_number.js", which will probably be released in the future.')
        let exp=BigInt(Exp)
        if (exp===0n)return this.#returnpackage(1)
        const isMinus=exp<0n
        if (isMinus)exp=-exp
        let result="1"
        let wgbs=String(n)
        while (exp>0n){
            if ((exp&1n)===1n){
                result=this.mul(result,wgbs)
            }
            exp>>=1n
            if (exp>0n){
                wgbs=this.mul(wgbs,wgbs)
            }
        }
        if (isMinus){
            result=this.div("1",result)
        }
        return this.#returnpackage(result)
    }

}
globalThis.decimalMath=decimalMath
globalThis.mathsup=mathsup
export default decimalMath
export {decimalMath,mathsup}