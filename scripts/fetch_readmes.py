import urllib.request, json, os, time

existing_repos = set()
with open('ALL_90_HACKATHON_REPOS_AND_READMES.md', 'r', encoding='utf-8') as f:
    text = f.read()
    for word in text.split():
        if word.startswith('https://github.com/'):
            existing_repos.add(word.strip('`|'))

new_repos = []
with open('ALL_HACKATHON_REPOS.md', 'r', encoding='utf-8') as f:
    for line in f:
        for word in line.split():
            if word.startswith('`https://github.com/'):
                url = word.strip('`|')
                if url not in existing_repos:
                    new_repos.append(url)

print(f'Found {len(new_repos)} repos to fetch READMEs for.')

appends = []
for repo_url in new_repos:
    repo_name = repo_url.replace('https://github.com/', '')
    api_url = f'https://api.github.com/repos/{repo_name}/readme'
    req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            download_url = data['download_url']
            readme_req = urllib.request.Request(download_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(readme_req) as readme_res:
                readme_content = readme_res.read().decode('utf-8', errors='ignore')
                appends.append(f'\n\n---\n\n## {repo_name}\n\n**Repository URL:** {repo_url}\n\n### README.md\n\n{readme_content}\n')
                print(f'Fetched {repo_name}')
    except Exception as e:
        print(f'Failed to fetch {repo_name}: {e}')
        appends.append(f'\n\n---\n\n## {repo_name}\n\n**Repository URL:** {repo_url}\n\n### README.md\n\n*(Could not fetch README: {e})*\n')
    time.sleep(0.5)

if appends:
    with open('ALL_90_HACKATHON_REPOS_AND_READMES.md', 'a', encoding='utf-8') as f:
        f.write(''.join(appends))
    print(f'Appended {len(appends)} READMEs.')
