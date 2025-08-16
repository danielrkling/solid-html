import { assign, AssignmentRules, defaultRules } from "./assign";
import { ResultType } from "./lit-html";
import { doc } from "./util";

const marker = "$marker$";

const walker = doc.createTreeWalker(doc, 4);

export function html(strings: TemplateStringsArray, ...values: any[]) {
  const template = doc.createElement("template");
  template.innerHTML = strings.join(marker);

  walker.currentNode = template.content;
  let index = 0;

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement!;
    const parts = node.textContent?.split(marker) || [];
    for (let i = 1; i < parts.length; i++) {
      const textNode = doc.createTextNode(parts[i]);
      const commentNode = doc.createComment(`${marker}${index++}`);
      parent.insertBefore(textNode, node);
      parent.insertBefore(commentNode, node);
      walker.currentNode = commentNode;
      
    }
    if (parts.length > 1){
        parent.removeChild(node);
    }
  }
  console.log( template.innerHTML);
  return template;
}
