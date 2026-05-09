from app.rag import retrieve, documents, document_sources
from groq import Groq
import os
import json
import re
from collections import Counter

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def tool_retrieve(input_text):
    results = retrieve(input_text)
    formatted_results = []
    for result in results:
        formatted_results.append({
            'text': result['text'],
            'source': result['source'],
            'confidence': result['confidence']
        })
    return json.dumps(formatted_results)

def tool_summarize(input_text):
    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0,
        messages=[
            {"role": "system", "content": "Summarize clearly."},
            {"role": "user", "content": input_text}
        ]
    )
    return resp.choices[0].message.content

def tool_search(input_text):
    """Search for specific keywords/phrases in documents with context"""
    query = input_text.lower()
    results = []
    
    for idx, doc in enumerate(documents):
        if query in doc.lower():
            # Get context (50 chars before and after)
            pos = doc.lower().find(query)
            start = max(0, pos - 50)
            end = min(len(doc), pos + len(query) + 50)
            context = doc[start:end]
            
            results.append({
                'text': context,
                'source': document_sources[idx] if idx < len(document_sources) else {'filename': 'unknown', 'page': 'unknown'},
                'match_position': pos
            })
    
    return json.dumps(results[:10])  # Limit to top 10 results

def tool_extract(input_text):
    """Extract specific entities (dates, names, emails, numbers, phone) from documents"""
    entity_type = input_text.lower()
    results = []
    
    for idx, doc in enumerate(documents):
        if entity_type == "dates":
            # Extract dates in various formats
            date_pattern = r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]+\d{1,2}[\s,]+\d{4}\b'
            matches = re.findall(date_pattern, doc, re.IGNORECASE)
            if matches:
                results.append({'source': document_sources[idx], 'entities': matches})
        
        elif entity_type == "emails":
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            matches = re.findall(email_pattern, doc)
            if matches:
                results.append({'source': document_sources[idx], 'entities': list(set(matches))})
        
        elif entity_type == "phone" or entity_type == "phone number" or entity_type == "contact":
            # Extract phone numbers in various formats
            phone_pattern = r'\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,15}'
            matches = re.findall(phone_pattern, doc)
            if matches:
                results.append({'source': document_sources[idx], 'entities': list(set(matches))})
            # Also extract emails for contact requests
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            email_matches = re.findall(email_pattern, doc)
            if email_matches:
                results.append({'source': document_sources[idx], 'entities': list(set(email_matches)), 'type': 'email'})
        
        elif entity_type == "numbers":
            number_pattern = r'\b\d+(?:,\d{3})*(?:\.\d+)?\b'
            matches = re.findall(number_pattern, doc)
            if matches:
                results.append({'source': document_sources[idx], 'entities': matches})
        
        elif entity_type == "names":
            # Simple name extraction (capitalized words)
            name_pattern = r'\b[A-Z][a-z]+ [A-Z][a-z]+\b'
            matches = re.findall(name_pattern, doc)
            if matches:
                results.append({'source': document_sources[idx], 'entities': list(set(matches))})
        
        else:
            # Extract all types
            date_pattern = r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b'
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            phone_pattern = r'\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,15}'
            number_pattern = r'\b\d+(?:,\d{3})*(?:\.\d+)?\b'
            
            dates = re.findall(date_pattern, doc)
            emails = re.findall(email_pattern, doc)
            phones = re.findall(phone_pattern, doc)
            numbers = re.findall(number_pattern, doc)
            
            if dates or emails or phones or numbers:
                results.append({
                    'source': document_sources[idx],
                    'dates': dates,
                    'emails': list(set(emails)),
                    'phones': list(set(phones)),
                    'numbers': numbers
                })
    
    return json.dumps(results)

def tool_compare(input_text):
    """Compare information across multiple documents - use LLM for meaningful comparison"""
    # Group documents by filename
    doc_groups = {}
    for idx, doc in enumerate(documents):
        source = document_sources[idx] if idx < len(document_sources) else {'filename': 'unknown'}
        filename = source.get('filename', 'unknown')
        if filename not in doc_groups:
            doc_groups[filename] = []
        doc_groups[filename].append(doc)
    
    # Prepare document texts for comparison
    doc_texts = []
    for filename, docs in doc_groups.items():
        full_text = ' '.join(docs)
        doc_texts.append(f"Document: {filename}\n{full_text[:2000]}")  # Limit to first 2000 chars
    
    combined_text = "\n\n".join(doc_texts)
    
    # Detect if this is a simple question or detailed comparison request
    simple_keywords = ['who is better', 'which one', 'more efficient', 'best candidate', 'recommend']
    is_simple_question = any(kw in input_text.lower() for kw in simple_keywords)
    
    if is_simple_question:
        # Simple, direct answer
        prompt = f"""
Based on these resumes, answer this question concisely: {input_text}

{combined_text}

Provide a short, direct answer (2-3 sentences maximum). Just state who is better and why.
"""
        system_msg = "You are an expert evaluator. Give concise, direct answers."
    else:
        # Detailed comparison report
        prompt = f"""
Compare the following resumes/candidates:

{combined_text}

Please provide a comparison that includes:
1. Skills comparison for each candidate
2. Experience level comparison
3. Education comparison
4. Overall recommendation on who is the better candidate
5. Reasoning for your recommendation

Keep it concise (under 300 words).
"""
        system_msg = "You are an expert HR professional and resume evaluator. Provide concise, fair comparisons."
    
    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0,
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": prompt}
        ]
    )
    
    return resp.choices[0].message.content

def tool_analyze(input_text):
    """Deep analysis (sentiment, key themes, topics)"""
    analysis_type = input_text.lower()
    
    if not documents:
        return json.dumps({'error': 'No documents loaded'})
    
    full_text = ' '.join(documents)
    words = [w.lower() for w in full_text.split() if len(w) > 3]
    word_count = len(words)
    
    if analysis_type == "sentiment":
        # Simple sentiment analysis based on positive/negative words
        positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'success', 'achieved', 'completed']
        negative_words = ['bad', 'poor', 'failed', 'error', 'issue', 'problem', 'difficulty']
        
        pos_count = sum(1 for w in words if w in positive_words)
        neg_count = sum(1 for w in words if w in negative_words)
        
        sentiment = 'neutral'
        if pos_count > neg_count * 1.5:
            sentiment = 'positive'
        elif neg_count > pos_count * 1.5:
            sentiment = 'negative'
        
        return json.dumps({
            'sentiment': sentiment,
            'positive_words': pos_count,
            'negative_words': neg_count,
            'total_words': word_count
        })
    
    elif analysis_type == "themes":
        common_words = Counter(words).most_common(20)
        return json.dumps({
            'key_themes': [{'word': w, 'count': c} for w, c in common_words],
            'total_unique_words': len(set(words))
        })
    
    else:  # General analysis
        common_words = Counter(words).most_common(10)
        return json.dumps({
            'total_words': word_count,
            'unique_words': len(set(words)),
            'key_themes': [w for w, c in common_words],
            'document_count': len(document_sources)
        })

def tool_list(input_text):
    """List all uploaded documents with metadata"""
    if not document_sources:
        return json.dumps({'error': 'No documents loaded'})
    
    # Group by filename
    doc_info = {}
    for source in document_sources:
        filename = source.get('filename', 'unknown')
        if filename not in doc_info:
            doc_info[filename] = {
                'filename': filename,
                'pages': set(),
                'chunk_count': 0
            }
        doc_info[filename]['pages'].add(source.get('page', 0))
        doc_info[filename]['chunk_count'] += 1
    
    result = []
    for filename, info in doc_info.items():
        result.append({
            'filename': filename,
            'total_pages': len(info['pages']),
            'total_chunks': info['chunk_count'],
            'page_range': f"{min(info['pages'])}-{max(info['pages'])}"
        })
    
    return json.dumps(result)
