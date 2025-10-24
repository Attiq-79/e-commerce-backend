const verifyEmailtemplate = ({name,url})=>{
return `
<P> Dear ${name}</p>
<p> Thank you for registring binkeyit</p>
<a href=${url} style="colour:white;background : blue;margin-top:10px">
verify Email
</a>
`
}
export default verifyEmailtemplate;