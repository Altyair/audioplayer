function Template () {}
Template.prototype.template = function (str) {
	str = (typeof str === "string") ? str : str.innerHTML;
	var p = [];
	p.push('var p = [];p.push(\'' + str
		.replace(/[\r\t\n]/g, "")
		.split("<%").join("\t")
		.replace(/((^|%>)[^\t]*)'/g, "$1\r")
		.replace(/\t=(.*?)%>/g, "',$1,'")
		.split("\t").join("');")
		.split("%>").join("p.push('")
		.split("\r").join("\\'") + '\');return p.join(\'\');');
	return new Function('data', p);
}
export default Template;