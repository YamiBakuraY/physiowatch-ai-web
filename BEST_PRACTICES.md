# 🛡️ Boas Práticas - PhysioWatch AI

## Guia de Desenvolvimento

### 1. Validação de Dados

#### ✅ SEMPRE validar entrada de usuário

```javascript
// ❌ Evitar
async function saveData(data) {
  localStorage.setItem('data', JSON.stringify(data));
}

// ✅ Fazer
async function saveData(data) {
  try {
    // Validar dados
    if (!data || typeof data !== 'object') {
      throw new Error('Dados inválidos');
    }
    
    // Validar campos obrigatórios
    if (!data.name?.trim() || !data.age) {
      throw new Error('Campo obrigatório vazio');
    }
    
    // Validar ranges
    if (data.age < 0 || data.age > 150) {
      throw new Error('Idade inválida');
    }
    
    localStorage.setItem('data', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Erro ao salvar:', error.message);
    alert(`Erro: ${error.message}`);
    return false;
  }
}
```

### 2. Tratamento de Erros

#### ✅ SEMPRE usar try-catch em operações críticas

```javascript
// ❌ Evitar
const handleSave = async (data) => {
  await saveToDB(data);
  setData(data);
  closeModal();
};

// ✅ Fazer
const handleSave = useCallback(async (data) => {
  try {
    if (!data) throw new Error('Dados inválidos');
    
    const success = await saveToDB(data);
    if (!success) throw new Error('Falha ao salvar');
    
    setData(data);
    closeModal();
  } catch (error) {
    console.error('Erro em handleSave:', error);
    alert(`Erro: ${error.message}`);
  }
}, []);
```

### 3. Feedback ao Usuário

#### ✅ SEMPRE fornecer feedback visual

```javascript
// ❌ Evitar - Silencioso
const submit = () => {
  saveData(formData);
  setView('home');
};

// ✅ Fazer - Com feedback
const submit = async () => {
  setError('');
  setSaving(true);
  
  try {
    await saveData(formData);
    setConfirmed(true); // Tela de sucesso
  } catch (err) {
    setError(err.message); // Exibe erro
  } finally {
    setSaving(false);
  }
};
```

### 4. Armazenamento Local

#### ✅ SEMPRE validar ao recuperar

```javascript
// ❌ Evitar
const data = JSON.parse(localStorage.getItem('data'));
if (data.length > 0) { // Pode falhar se data é null
  // usar data
}

// ✅ Fazer
const data = await safeGet('data');
if (Array.isArray(data) && data.length > 0) {
  // usar data
}
```

### 5. Estados React

#### ✅ SEMPRE usar useCallback para funções

```javascript
// ❌ Evitar - Recria função a cada render
const handleClick = () => {
  doSomething(data);
};

// ✅ Fazer - Memoriza função
const handleClick = useCallback(() => {
  doSomething(data);
}, [data]);
```

### 6. Validação de Números

#### ✅ SEMPRE definir ranges

```javascript
// ❌ Evitar
const numOr = (v, d) => Number(v) || d;
const fc = numOr(inputFC, 72); // Pode ser 0 ou negativo

// ✅ Fazer
const isValidNumber = (val, min = 0, max = 999) => {
  const num = Number(val);
  return !isNaN(num) && num >= min && num <= max;
};

if (isValidNumber(inputFC, 40, 200)) {
  const fc = Number(inputFC);
  // usar fc
} else {
  setError('FC deve estar entre 40-200 bpm');
}
```

### 7. Operações Destrutivas

#### ✅ SEMPRE pedir confirmação

```javascript
// ❌ Evitar - Sem confirmação
const handleDelete = async (id) => {
  await deletePatient(id);
  setPatients(patients.filter(p => p.id !== id));
};

// ✅ Fazer - Com confirmação
const handleDelete = useCallback(async (id) => {
  const confirm = window.confirm(
    'Deseja excluir este paciente? Esta ação não pode ser desfeita.'
  );
  if (!confirm) return;
  
  try {
    await deletePatient(id);
    setPatients(patients.filter(p => p.id !== id));
  } catch (error) {
    alert(`Erro: ${error.message}`);
  }
}, [patients]);
```

### 8. Logging

#### ✅ SEMPRE usar console apropriado

```javascript
// Log de erro
console.error('Erro crítico:', error);

// Log de aviso
console.warn('Aviso não-crítico:', warning);

// Log de informação
console.log('Info:', data);

// NUNCA logar dados sensíveis
// ❌ console.log('Password:', password);
```

### 9. Valores Padrão

#### ✅ SEMPRE fornecer fallbacks

```javascript
// ❌ Evitar
const entries = entriesMap[patientId]; // Pode ser undefined
entries.map(...); // Erro!

// ✅ Fazer
const entries = entriesMap[patientId] || [];
entries.map(...); // Seguro
```

### 10. Limpeza de Modal

#### ✅ SEMPRE limpar estado após sucesso

```javascript
// ❌ Evitar
const handleSubmit = () => {
  saveData(formData);
  closeModal();
  // Estados da forma ainda têm valores antigos
};

// ✅ Fazer
const handleSubmit = async () => {
  try {
    await saveData(formData);
    setName('');
    setAge('');
    setPassword('');
    closeModal();
  } catch (error) {
    setError(error.message);
  }
};
```

### 11. Nomes de Variáveis

#### ✅ SEMPRE ser descritivo

```javascript
// ❌ Evitar
const [d, setD] = useState([]);
const [e, setE] = useState('');
const [s, setS] = useState(false);

// ✅ Fazer
const [entries, setEntries] = useState([]);
const [error, setError] = useState('');
const [isSaving, setIsSaving] = useState(false);
```

### 12. Mensagens de Erro

#### ✅ SEMPRE ser específico e útil

```javascript
// ❌ Evitar
if (data.password !== password) {
  setError('Erro');
}

// ✅ Fazer
if (data.password !== currentPassword) {
  setError('Senha atual incorreta. Tente novamente.');
}
```

### 13. Async/Await

#### ✅ SEMPRE tratar promises

```javascript
// ❌ Evitar
useEffect(() => {
  loadData();
}, []);

// ✅ Fazer
useEffect(() => {
  const effect = async () => {
    try {
      const result = await loadData();
      setData(result);
    } catch (error) {
      setError(error.message);
    }
  };
  
  effect();
}, []);
```

### 14. Tipos de Entrada

#### ✅ SEMPRE usar type correto

```html
<!-- ❌ Evitar -->
<input type="text" placeholder="123" />

<!-- ✅ Fazer -->
<input type="number" min="0" max="10" placeholder="Ex: 5" />
<input type="email" placeholder="email@example.com" />
<input type="password" placeholder="Sua senha" />
<input type="time" placeholder="HH:MM" />
```

### 15. Acessibilidade

#### ✅ SEMPRE adicionar labels

```jsx
// ❌ Evitar
<input placeholder="Nome" />

// ✅ Fazer
<label htmlFor="name" className="text-sm font-medium">
  Nome completo
</label>
<input id="name" placeholder="Ex: João Silva" />
```

---

## Checklist de Qualidade

Antes de fazer commit:

- [ ] Sem erros no console
- [ ] Sem warnings de React
- [ ] Todos os campos validados
- [ ] Todos os async/await têm try-catch
- [ ] Mensagens de erro em português
- [ ] Feedback visual ao usuário
- [ ] Operações destrutivas têm confirmação
- [ ] Nomes de variáveis descritivos
- [ ] Sem código comentado
- [ ] Sem console.log desnecessários
- [ ] Sem dados sensíveis em logs

---

## Recursos Úteis

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [Lucide Icons](https://lucide.dev)
- [MDN Web Docs](https://developer.mozilla.org)

---

**Desenvolvido com 💪 para PhysioWatch AI**
